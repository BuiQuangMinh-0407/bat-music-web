// server/routes/contact.js
const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');
const adminAuth = require('../middleware/adminAuth');
const rateLimit = require('express-rate-limit');

// Chống spam gửi form liên hệ (tối đa 5 yêu cầu / 5 phút cho mỗi IP)
const contactLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 5,
  message: { success: false, message: 'Bạn đã gửi yêu cầu. Vui lòng chờ ít phút trước khi gửi lại.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// POST /api/contact — Khách hàng gửi yêu cầu / tin nhắn
router.post('/', contactLimiter, async (req, res) => {
  try {
    const { name, email, phone, type, budget, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: 'Vui lòng điền tên, email và nội dung tin nhắn' });
    }

    const contact = await Contact.create({
      name,
      email,
      phone: phone || '',
      type: type || 'custom-beat',
      budget: budget || '',
      message,
    });

    console.log(`📩 [TIN NHẮN MỚI TỪ ${name} (${email})]: ${message}`);

    res.status(201).json({
      success: true,
      message: 'Cảm ơn bạn! Yêu cầu đã được gửi tới BAT Music. Chúng tôi sẽ phản hồi trong 24h.',
      data: contact,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/contact — Admin xem toàn bộ danh sách tin nhắn & yêu cầu
router.get('/', adminAuth, async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.json({ success: true, data: contacts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/contact/:id — Admin cập nhật trạng thái tin nhắn
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const { status } = req.body;
    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!contact) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy tin nhắn' });
    }

    res.json({ success: true, data: contact });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE /api/contact/:id — Admin xóa tin nhắn
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);
    if (!contact) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy tin nhắn' });
    }
    res.json({ success: true, message: 'Đã xóa tin nhắn' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
