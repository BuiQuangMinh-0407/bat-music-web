const express   = require('express');
const router    = express.Router();
const Order     = require('../models/Order');
const User      = require('../models/User');
const { authMiddleware } = require('./auth');

// Nhật ký lưu 20 webhook gần nhất để tiện kiểm tra
const webhookLogs = [];

// POST /create-order — Tạo đơn hàng thanh toán
router.post('/create-order', authMiddleware, async (req, res) => {
  try {
    let { amount, trackIds } = req.body;
    if (!trackIds || trackIds.length === 0) {
      return res.status(400).json({ success: false, message: 'Thiếu thông tin danh sách bài hát' });
    }
    if (!amount) {
      amount = trackIds.length * 5000;
    }

    // Tạo mã đơn ngẫu nhiên 6 ký tự: BAT-XXXXXX
    const codeSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
    const orderCode = `BAT-${codeSuffix}`;

    const order = await Order.create({
      userId: req.userId,
      trackIds,
      amount,
      orderCode,
      status: 'pending',
    });

    console.log(`🛒 Đã tạo đơn hàng mới: ${orderCode} | User: ${req.userId} | Tiền: ${amount}đ`);

    res.status(201).json({
      success: true,
      orderCode: order.orderCode,
      amount: order.amount,
      paymentMethod: order.paymentMethod
    });
  } catch (err) {
    console.error('Lỗi tạo đơn hàng:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /sepay-webhook — Nhận thông báo chuyển khoản tự động từ SePay.vn
router.post('/sepay-webhook', async (req, res) => {
  const timestamp = new Date().toISOString();
  const rawAuth = req.headers['authorization'] || '';
  const body = req.body || {};

  const logEntry = {
    time: timestamp,
    headers: { authorization: rawAuth },
    body,
    result: 'processing'
  };

  try {
    // 1. Kiểm tra xác thực (linh hoạt với nhiều định dạng header từ SePay)
    const expectedKey = (process.env.SEPAY_API_KEY || '').trim();
    if (expectedKey) {
      const isAuthValid =
        rawAuth === `Apikey ${expectedKey}` ||
        rawAuth === `apikey ${expectedKey}` ||
        rawAuth === `Bearer ${expectedKey}` ||
        rawAuth === expectedKey ||
        rawAuth.includes(expectedKey);

      if (!isAuthValid) {
        console.warn(`⚠️ SePay Webhook từ chối: Authorization không khớp. Nhận: "${rawAuth}"`);
        logEntry.result = 'unauthorized';
        webhookLogs.unshift(logEntry);
        if (webhookLogs.length > 20) webhookLogs.pop();
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }
    }

    // 2. Trích xuất thông tin giao dịch (hỗ trợ cả camelCase và snake_case)
    const content = (body.content || body.description || '').toString().trim();
    const transferAmount = Number(body.transferAmount || body.transfer_amount || body.amount || 0);
    const transferType = (body.transferType || body.transfer_type || 'in').toString().toLowerCase();

    console.log('💳 [SePay Webhook] Giao dịch mới:', { content, transferAmount, transferType });

    if (transferType !== 'in') {
      logEntry.result = 'ignored: not incoming transfer';
      webhookLogs.unshift(logEntry);
      if (webhookLogs.length > 20) webhookLogs.pop();
      return res.json({ success: true, message: 'Not an incoming transfer' });
    }

    // 3. Tìm mã đơn hàng trong nội dung chuyển khoản
    // Chấp nhận: BAT-XXXXXX, BAT XXXXXX, BATXXXXXX, hoặc chữ thường
    const upperText = content.toUpperCase();
    const regexMatch = upperText.match(/BAT[-_ ]?([A-Z0-9]{6})/);
    let targetCode = regexMatch ? `BAT-${regexMatch[1]}` : null;

    let order = null;
    if (targetCode) {
      order = await Order.findOne({ orderCode: targetCode, status: 'pending' });
    }

    // Nếu không khớp regex chính xác, quét các đơn pending gần đây
    if (!order) {
      const pendingOrders = await Order.find({ status: 'pending' }).sort({ createdAt: -1 }).limit(30);
      const cleanText = upperText.replace(/[^A-Z0-9]/g, '');

      for (const po of pendingOrders) {
        const pureCode = po.orderCode.replace(/[^A-Z0-9]/g, ''); // BATXXXXXX
        const suffix   = po.orderCode.split('-')[1];            // XXXXXX
        if (cleanText.includes(pureCode) || (suffix && cleanText.includes(suffix))) {
          order = po;
          console.log(`🎯 Tìm thấy đơn pending khớp nội dung chuyển khoản: ${po.orderCode}`);
          break;
        }
      }
    }

    if (!order) {
      console.warn(`⚠️ [SePay Webhook] Không tìm thấy đơn hàng pending nào cho nội dung: "${content}"`);
      logEntry.result = `order not found for content: ${content}`;
      webhookLogs.unshift(logEntry);
      if (webhookLogs.length > 20) webhookLogs.pop();
      return res.json({ success: true, message: 'Order not found or already processed' });
    }

    // 4. Khớp số tiền và mở khoá
    if (transferAmount >= order.amount) {
      order.status = 'paid';
      order.paidAt = new Date();
      await order.save();

      const user = await User.findById(order.userId);
      if (user) {
        order.trackIds.forEach((trackId) => {
          if (!user.unlockedTracks.map(String).includes(String(trackId))) {
            user.unlockedTracks.push(trackId);
          }
        });
        await user.save();
        console.log(`🎉 [SePay Webhook] ĐÃ MỞ KHOÁ THÀNH CÔNG ${order.trackIds.length} BÀI CHO: ${user.email}`);
      }

      logEntry.result = `success: unlocked order ${order.orderCode} for user ${user?.email}`;
    } else {
      console.warn(`⚠️ Số tiền chuyển (${transferAmount}đ) nhỏ hơn giá trị đơn (${order.amount}đ)`);
      logEntry.result = `amount mismatch: got ${transferAmount}, need ${order.amount}`;
    }

    webhookLogs.unshift(logEntry);
    if (webhookLogs.length > 20) webhookLogs.pop();

    res.json({ success: true, orderCode: order.orderCode, status: order.status });
  } catch (err) {
    console.error('Lỗi xử lý SePay Webhook:', err);
    logEntry.result = `error: ${err.message}`;
    webhookLogs.unshift(logEntry);
    if (webhookLogs.length > 20) webhookLogs.pop();
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /check/:orderCode — Polling kiểm tra trạng thái đơn hàng (không bắt buộc auth để tránh lỗi token)
router.get('/check/:orderCode', async (req, res) => {
  try {
    const { orderCode } = req.params;
    const order = await Order.findOne({ orderCode });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
    }

    res.json({
      success: true,
      status: order.status,
      trackIds: order.trackIds,
      amount: order.amount,
      paidAt: order.paidAt
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /webhook-logs — Xem lịch sử webhook gần nhất (để kiểm tra lỗi)
router.get('/webhook-logs', (req, res) => {
  res.json({
    success: true,
    totalLogs: webhookLogs.length,
    configuredApiKey: process.env.SEPAY_API_KEY ? 'ĐÃ CẤU HÌNH (OK)' : 'CHƯA CẤU HÌNH (TRỐNG)',
    logs: webhookLogs,
  });
});

// GET /recent-orders — Xem 15 đơn hàng gần nhất
router.get('/recent-orders', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 }).limit(15).populate('userId', 'name email');
    res.json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /manual-unlock — Hỗ trợ mở khoá thủ công nếu khách chuyển khoản nhưng ngân hàng cắt chữ
router.post('/manual-unlock', async (req, res) => {
  try {
    const { orderCode, adminPassword } = req.body;
    if (adminPassword !== (process.env.ADMIN_PASSWORD || 'bat2026')) {
      return res.status(401).json({ success: false, message: 'Mật khẩu admin không đúng' });
    }

    const order = await Order.findOne({ orderCode });
    if (!order) return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });

    order.status = 'paid';
    order.paidAt = new Date();
    await order.save();

    const user = await User.findById(order.userId);
    if (user) {
      order.trackIds.forEach((trackId) => {
        if (!user.unlockedTracks.map(String).includes(String(trackId))) {
          user.unlockedTracks.push(trackId);
        }
      });
      await user.save();
    }

    res.json({ success: true, message: 'Đã mở khoá thành công', orderCode: order.orderCode });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
