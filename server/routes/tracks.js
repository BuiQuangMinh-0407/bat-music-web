const express  = require('express');
const path     = require('path');
const router   = express.Router();
const Track    = require('../models/Track');
const User     = require('../models/User');
const { authMiddleware } = require('./auth');

// GET /api/tracks/:id/download — tải beat đã mua (cần login + unlock)
router.get('/:id/download', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(401).json({ success: false, message: 'Unauthorized' });

    // Kiểm tra xem user đã mở khoá track này chưa
    const trackId = req.params.id;
    if (!user.unlockedTracks.map(String).includes(trackId)) {
      return res.status(403).json({ success: false, message: 'Bạn chưa mở khoá bài này' });
    }

    const track = await Track.findById(trackId);
    if (!track || !track.audioUrl) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy file audio' });
    }

    // Nếu audioUrl là đường dẫn local (bắt đầu bằng /uploads/)
    if (track.audioUrl.startsWith('/uploads/')) {
      const filePath = path.join(__dirname, '../../public', track.audioUrl);
      const fileName = `${track.title || 'beat'}.mp3`;
      return res.download(filePath, fileName);
    }

    // Nếu là URL bên ngoài → redirect
    res.redirect(track.audioUrl);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/tracks — lấy tất cả bài hát
router.get('/', async (req, res) => {
  try {
    const { genre, featured } = req.query;
    const filter = {};
    if (genre && genre !== 'All') filter.genre = genre;
    if (featured === 'true') filter.featured = true;

    const tracks = await Track.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, data: tracks });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/tracks/:id — lấy 1 bài
router.get('/:id', async (req, res) => {
  try {
    const track = await Track.findById(req.params.id);
    if (!track) return res.status(404).json({ success: false, message: 'Không tìm thấy bài hát' });
    res.json({ success: true, data: track });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

const adminAuth = require('../middleware/adminAuth');

// POST /api/tracks — thêm bài mới (cần admin)
router.post('/', adminAuth, async (req, res) => {
  try {
    const track = new Track(req.body);
    await track.save();
    res.status(201).json({ success: true, data: track });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PUT /api/tracks/:id — cập nhật bài (cần admin)
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const track = await Track.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true,
    });
    if (!track) return res.status(404).json({ success: false, message: 'Không tìm thấy bài hát' });
    res.json({ success: true, data: track });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE /api/tracks/:id — xóa bài (cần admin)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const track = await Track.findByIdAndDelete(req.params.id);
    if (!track) return res.status(404).json({ success: false, message: 'Không tìm thấy bài hát' });
    res.json({ success: true, message: 'Đã xóa bài hát' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
