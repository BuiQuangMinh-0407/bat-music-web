// server/middleware/adminAuth.js
module.exports = function adminAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Yêu cầu quyền Admin' });
  }
  const token = authHeader.split(' ')[1];
  if (token === 'bat-admin-token-2026') {
    next();
  } else {
    res.status(403).json({ success: false, message: 'Token admin không hợp lệ' });
  }
};
