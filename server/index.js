require('dotenv').config({ path: __dirname + '/.env' });

// Force dùng Google DNS 8.8.8.8 để resolve MongoDB SRV
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');
const path     = require('path');

const tracksRouter = require('./routes/tracks');
const uploadRouter = require('./routes/upload');
const authRouter   = require('./routes/auth');
const adminRouter  = require('./routes/admin');
const contactRouter = require('./routes/contact');
const paymentRouter = require('./routes/payment');

const app  = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ────────────────────────────────────────────────────────────────
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Cho phép requests không có origin (ví dụ mobile, curl, webhook), localhost, hoặc bất kỳ domain Vercel nào
    if (
      !origin ||
      origin.endsWith('.vercel.app') ||
      allowedOrigins.includes(origin) ||
      process.env.NODE_ENV !== 'production'
    ) {
      callback(null, true);
    } else {
      callback(new Error('Chặn bởi CORS Policy'));
    }
  },
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve file uploads tĩnh (ảnh + audio)
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/tracks',  tracksRouter);
app.use('/api/upload',  uploadRouter);
app.use('/api/auth',    authRouter);
app.use('/api/admin',   adminRouter);
app.use('/api/contact', contactRouter);
app.use('/api/payment', paymentRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// ── Start Server ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
});

// ── MongoDB ───────────────────────────────────────────────────────────────────
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ Đã kết nối MongoDB Atlas!');
  })
  .catch((err) => {
    console.error('❌ Lỗi kết nối MongoDB:', err.message);
  });
