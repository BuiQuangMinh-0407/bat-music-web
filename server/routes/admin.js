// server/routes/admin.js
const express   = require('express');
const router    = express.Router();
const jwt       = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const User      = require('../models/User');
const Track     = require('../models/Track');
const adminAuth = require('../middleware/adminAuth');

// Chống brute-force mật khẩu admin (tối đa 5 lần thử sai trong 15 phút)
const adminLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Nhập sai quá nhiều lần. Vui lòng thử lại sau 15 phút.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// POST /api/admin/login — Đăng nhập admin
router.post('/login', adminLoginLimiter, (req, res) => {
  const { password } = req.body;
  const adminPass = process.env.ADMIN_PASSWORD || 'bat2026';
  
  if (password === adminPass) {
    const token = jwt.sign(
      { role: 'admin' },
      process.env.JWT_SECRET || 'bat-music-jwt-secret-2026-do-not-share',
      { expiresIn: '7d' }
    );
    res.json({ success: true, token });
  } else {
    res.status(401).json({ success: false, message: 'Sai mật khẩu quản trị' });
  }
});

// GET /api/admin/users — Danh sách users + beats đã mua (cần admin)
router.get('/users', adminAuth, async (req, res) => {
  try {
    const users = await User.find({}, '-password')
      .populate('unlockedTracks')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/admin/stats — Thống kê doanh thu + hoạt động (cần admin)
router.get('/stats', adminAuth, async (req, res) => {
  try {
    const usersCount = await User.countDocuments();
    const tracksCount = await Track.countDocuments();
    
    // Tính doanh thu: mỗi bài hát unlock = 5000 VNĐ
    const users = await User.find({}, 'unlockedTracks');
    let totalUnlocks = 0;
    users.forEach(u => {
      totalUnlocks += (u.unlockedTracks ? u.unlockedTracks.length : 0);
    });

    const totalRevenue = totalUnlocks * 5000;

    res.json({
      success: true,
      stats: {
        totalUsers: usersCount,
        totalTracks: tracksCount,
        totalUnlocks,
        totalRevenue,
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
