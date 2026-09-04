// server/routes/admin.js
const express = require('express');
const router  = express.Router();
const User    = require('../models/User');
const Track   = require('../models/Track');
const adminAuth = require('../middleware/adminAuth');

// POST /api/admin/login — Đăng nhập admin
router.post('/login', (req, res) => {
  const { password } = req.body;
  if (password === process.env.ADMIN_PASSWORD) {
    res.json({ success: true, token: 'bat-admin-token-2026' });
  } else {
    res.status(401).json({ success: false, message: 'Sai mật khẩu' });
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
