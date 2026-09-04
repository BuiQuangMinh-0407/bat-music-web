// server/middleware/adminAuth.js
const jwt = require('jsonwebtoken');

module.exports = function adminAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Yêu cầu quyền Admin' });
  }
  const token = authHeader.split(' ')[1];
  
  // Xác thực JWT token thật với chữ ký bí mật
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'bat-music-jwt-secret-2026-do-not-share');
    if (decoded && decoded.role === 'admin') {
      req.isAdmin = true;
      return next();
    }
  } catch (err) {
    // Tiếp tục kiểm tra fallback
  }

  // Hỗ trợ tạm thời nếu còn lưu session cũ trên trình duyệt
  if (token === 'bat-admin-token-2026') {
    return next();
  }

  return res.status(403).json({ success: false, message: 'Token admin không hợp lệ hoặc đã hết hạn' });
};
