// server/routes/auth.js
const express = require('express');
const jwt     = require('jsonwebtoken');
const crypto  = require('crypto');
const rateLimit = require('express-rate-limit');
const User    = require('../models/User');
const { sendPasswordResetEmail } = require('../services/emailService');

const router = express.Router();

// Tối đa 5 lần gửi yêu cầu auth trong 1 phút để chống brute-force
const authLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 phút
  max: 10,
  message: { success: false, message: 'Thao tác quá nhanh. Vui lòng thử lại sau ít phút.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const JWT_SECRET = process.env.JWT_SECRET || 'bat-music-jwt-secret-2026-do-not-share';
const JWT_EXPIRY = '7d';

// ── Helper: tạo JWT ─────────────────────────────────────────────────────────
function signToken(user) {
  return jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRY });
}

// ── Middleware: xác thực JWT ────────────────────────────────────────────────
function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Chưa đăng nhập' });
  }
  try {
    const decoded = jwt.verify(header.split(' ')[1], JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch {
    return res.status(401).json({ success: false, message: 'Token hết hạn' });
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// ĐĂNG KÝ
// ══════════════════════════════════════════════════════════════════════════════
router.post('/register', authLimiter, async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Vui lòng điền đầy đủ thông tin' });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Mật khẩu tối thiểu 6 ký tự' });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ success: false, message: 'Email này đã được đăng ký' });
    }

    const user  = await User.create({ name, email, password, provider: 'local' });
    const token = signToken(user);

    res.status(201).json({ success: true, token, user: user.toSafeJSON() });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// ĐĂNG NHẬP
// ══════════════════════════════════════════════════════════════════════════════
router.post('/login', authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập email và mật khẩu' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Email chưa được đăng ký' });
    }

    if (user.provider !== 'local') {
      return res.status(401).json({
        success: false,
        message: `Tài khoản này dùng ${user.provider === 'google' ? 'Google' : 'Facebook'} để đăng nhập`,
      });
    }

    const valid = await user.comparePassword(password);
    if (!valid) {
      return res.status(401).json({ success: false, message: 'Sai mật khẩu' });
    }

    const token = signToken(user);
    res.json({ success: true, token, user: user.toSafeJSON() });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// ĐĂNG NHẬP BẰNG GOOGLE (Xác thực Token thật / OAuth)
// ══════════════════════════════════════════════════════════════════════════════
router.post('/google', authLimiter, async (req, res) => {
  try {
    const { credential, email: manualEmail, name: manualName, avatar: manualAvatar } = req.body;

    let email = manualEmail;
    let name = manualName;
    let avatar = manualAvatar;
    let providerId = `google_${Date.now()}`;

    // Nếu gửi Google ID Token thật → xác thực trực tiếp qua Google OAuth API
    if (credential) {
      const gRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`);
      const gData = await gRes.json();

      if (!gRes.ok || !gData.email) {
        return res.status(400).json({ success: false, message: 'Google Token không hợp lệ hoặc đã hết hạn' });
      }

      email = gData.email;
      name = gData.name || gData.email.split('@')[0];
      avatar = gData.picture || '';
      providerId = gData.sub;
    }

    if (!email) {
      return res.status(400).json({ success: false, message: 'Không tìm thấy thông tin email từ Google' });
    }

    let user = await User.findOne({
      $or: [
        { provider: 'google', providerId },
        { email },
      ],
    });

    if (user) {
      if (avatar && avatar !== user.avatar) {
        user.avatar = avatar;
        await user.save();
      }
    } else {
      user = await User.create({
        name: name || email.split('@')[0],
        email,
        avatar: avatar || '',
        provider: 'google',
        providerId,
      });
    }

    const token = signToken(user);
    res.json({ success: true, token, user: user.toSafeJSON() });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// ĐĂNG NHẬP BẰNG FACEBOOK (Xác thực Graph API Token thật)
// ══════════════════════════════════════════════════════════════════════════════
router.post('/facebook', authLimiter, async (req, res) => {
  try {
    const { accessToken, email: manualEmail, name: manualName, avatar: manualAvatar } = req.body;

    let email = manualEmail;
    let name = manualName;
    let avatar = manualAvatar;
    let providerId = `facebook_${Date.now()}`;

    // Nếu gửi Facebook Access Token thật → xác thực qua Facebook Graph API
    if (accessToken) {
      const fbRes = await fetch(`https://graph.facebook.com/me?fields=id,name,email,picture.type(large)&access_token=${accessToken}`);
      const fbData = await fbRes.json();

      if (!fbRes.ok || fbData.error) {
        return res.status(400).json({ success: false, message: 'Facebook Token không hợp lệ' });
      }

      email = fbData.email || `${fbData.id}@facebook.user`;
      name = fbData.name || 'Facebook User';
      avatar = fbData.picture?.data?.url || '';
      providerId = fbData.id;
    }

    if (!email) {
      return res.status(400).json({ success: false, message: 'Thiếu email từ Facebook' });
    }

    let user = await User.findOne({
      $or: [
        { provider: 'facebook', providerId },
        { email },
      ],
    });

    if (user) {
      if (avatar && avatar !== user.avatar) {
        user.avatar = avatar;
        await user.save();
      }
    } else {
      user = await User.create({
        name: name || email.split('@')[0],
        email,
        avatar: avatar || '',
        provider: 'facebook',
        providerId,
      });
    }

    const token = signToken(user);
    res.json({ success: true, token, user: user.toSafeJSON() });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// ĐĂNG NHẬP BẰNG SOCIAL GENERIC
// ══════════════════════════════════════════════════════════════════════════════
router.post('/social', authLimiter, async (req, res) => {
  try {
    const { name, email, avatar, provider, providerId } = req.body;

    if (!email || !provider || !providerId) {
      return res.status(400).json({ success: false, message: 'Thiếu thông tin đăng nhập' });
    }

    // Tìm user đã có hoặc tạo mới
    let user = await User.findOne({
      $or: [
        { provider, providerId },
        { email },
      ],
    });

    if (user) {
      // Cập nhật avatar nếu có
      if (avatar && avatar !== user.avatar) {
        user.avatar = avatar;
        await user.save();
      }
    } else {
      // Tạo mới
      user = await User.create({
        name:       name || email.split('@')[0],
        email,
        avatar:     avatar || '',
        provider,
        providerId,
      });
    }

    const token = signToken(user);
    res.json({ success: true, token, user: user.toSafeJSON() });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// LẤY THÔNG TIN USER HIỆN TẠI
// ══════════════════════════════════════════════════════════════════════════════
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ success: false, message: 'User không tồn tại' });
    res.json({ success: true, user: user.toSafeJSON() });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// QUÊN MẬT KHẨU — Tạo reset token
// ══════════════════════════════════════════════════════════════════════════════
router.post('/forgot-password', authLimiter, async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Vui lòng nhập email' });

    const user = await User.findOne({ email });
    if (!user) {
      // Vẫn trả success để không leak info
      return res.json({ success: true, message: 'Nếu email tồn tại, link đặt lại mật khẩu đã được gửi' });
    }

    if (user.provider !== 'local') {
      return res.status(400).json({
        success: false,
        message: `Tài khoản này dùng ${user.provider === 'google' ? 'Google' : 'Facebook'}, không có mật khẩu để reset`,
      });
    }

    // Tạo token 6 số
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetToken       = crypto.createHash('sha256').update(resetCode).digest('hex');
    user.resetTokenExpiry = Date.now() + 15 * 60 * 1000; // 15 phút
    await user.save();

    // Gửi email thật qua Nodemailer (hoặc demo log nếu chưa cấu hình Gmail)
    const emailResult = await sendPasswordResetEmail(email, resetCode);

    res.json({
      success: true,
      message: 'Mã xác nhận đã được gửi đến email của bạn',
      code: emailResult.mode === 'demo' ? resetCode : undefined,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// ĐẶT LẠI MẬT KHẨU
// ══════════════════════════════════════════════════════════════════════════════
router.post('/reset-password', authLimiter, async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    if (!email || !code || !newPassword) {
      return res.status(400).json({ success: false, message: 'Thiếu thông tin' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Mật khẩu tối thiểu 6 ký tự' });
    }

    const hashedCode = crypto.createHash('sha256').update(code).digest('hex');
    const user = await User.findOne({
      email,
      resetToken:       hashedCode,
      resetTokenExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Mã không hợp lệ hoặc đã hết hạn' });
    }

    user.password         = newPassword;
    user.resetToken       = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    const token = signToken(user);
    res.json({ success: true, token, user: user.toSafeJSON(), message: 'Đặt lại mật khẩu thành công' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// MỞ KHOÁ TRACK (cần đăng nhập)
// ══════════════════════════════════════════════════════════════════════════════
router.post('/unlock-track', authMiddleware, async (req, res) => {
  try {
    const { trackId } = req.body;
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ success: false });

    if (!user.unlockedTracks.includes(trackId)) {
      user.unlockedTracks.push(trackId);
      await user.save();
    }

    res.json({ success: true, unlockedTracks: user.unlockedTracks });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// CẬP NHẬT THÔNG TIN CÁ NHÂN (cần đăng nhập)
// ══════════════════════════════════════════════════════════════════════════════
router.put('/update', authMiddleware, async (req, res) => {
  try {
    const { name, avatar } = req.body;
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ success: false, message: 'User không tồn tại' });

    if (name) user.name = name;
    if (avatar !== undefined) user.avatar = avatar;

    await user.save();
    res.json({ success: true, user: user.toSafeJSON() });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// ĐỔI MẬT KHẨU (cần đăng nhập)
// ══════════════════════════════════════════════════════════════════════════════
router.put('/change-password', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ success: false, message: 'User không tồn tại' });

    if (user.provider !== 'local') {
      return res.status(400).json({ success: false, message: 'Tài khoản MXH không thể đổi mật khẩu trực tiếp' });
    }

    const valid = await user.comparePassword(currentPassword);
    if (!valid) {
      return res.status(400).json({ success: false, message: 'Mật khẩu hiện tại không đúng' });
    }

    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: 'Đổi mật khẩu thành công' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
module.exports.authMiddleware = authMiddleware;
