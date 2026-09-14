const express   = require('express');
const router    = express.Router();
const rateLimit = require('express-rate-limit');
const Order     = require('../models/Order');
const User      = require('../models/User');
const { authMiddleware } = require('./auth');

// Fix #5: Rate limit chống spam tạo đơn hàng (tối đa 5 đơn / 5 phút)
const paymentLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 5,
  message: { success: false, message: 'Tạo đơn hàng quá nhanh. Vui lòng chờ 5 phút.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// POST /create-order
router.post('/create-order', authMiddleware, paymentLimiter, async (req, res) => {
  try {
    let { amount, trackIds } = req.body;
    if (!trackIds || trackIds.length === 0) {
      return res.status(400).json({ success: false, message: 'Thiếu thông tin danh sách bài hát' });
    }
    if (!amount) {
      amount = trackIds.length * 5000;
    }

    const orderCode = 'BAT-' + Math.random().toString(36).substring(2, 8).toUpperCase();

    const order = await Order.create({
      userId: req.userId,
      trackIds,
      amount,
      orderCode,
    });

    res.status(201).json({
      success: true,
      orderCode: order.orderCode,
      amount: order.amount,
      paymentMethod: order.paymentMethod
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /sepay-webhook
router.post('/sepay-webhook', async (req, res) => {
  try {
    const apiKey = req.headers['authorization'];
    if (process.env.SEPAY_API_KEY && apiKey !== `Apikey ${process.env.SEPAY_API_KEY}`) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { content, transferAmount, transferType } = req.body;
    
    if (transferType !== 'in') {
      return res.json({ success: true, message: 'Not an incoming transfer' });
    }

    // Tìm mã đơn hàng BAT-XXXXXX trong nội dung chuyển khoản
    const match = content ? content.toUpperCase().match(/BAT-[A-Z0-9]{6}/) : null;
    if (!match) {
      return res.json({ success: true, message: 'No valid order code found' });
    }

    const orderCode = match[0];
    
    
    const order = await Order.findOne({ orderCode, status: 'pending' });
    if (!order) {
      return res.json({ success: true, message: 'Order not found or already processed' });
    }

    if (Number(transferAmount) >= order.amount) {
      order.status = 'paid';
      order.paidAt = new Date();
      await order.save();

      const user = await User.findById(order.userId);
      if (user) {
        order.trackIds.forEach(trackId => {
          if (!user.unlockedTracks.includes(trackId)) {
            user.unlockedTracks.push(trackId);
          }
        });
        await user.save();
      }
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Fix #4: GET /check/:orderCode — BẮT BUỘC đăng nhập + kiểm tra chủ sở hữu
router.get('/check/:orderCode', authMiddleware, async (req, res) => {
  try {
    const { orderCode } = req.params;
    const order = await Order.findOne({ orderCode, userId: req.userId });
    
    if (!order) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
    }

    res.json({
      success: true,
      status: order.status,
      trackIds: order.trackIds
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
