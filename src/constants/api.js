// constants/api.js
// Tự động nhận diện URL API: chạy local hoặc chạy trên mạng (Vercel / Render)
const BACKEND_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/+$/, '');

export const API_BASE = BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

/**
 * Chuyển đổi đường dẫn tương đối (/uploads/...) thành URL đầy đủ
 */
export function getMediaUrl(url) {
  if (!url) return '';
  // Nếu url chứa localhost:5000 hoặc 127.0.0.1:5000, thay bằng API_BASE thật trên Render
  if (url.includes('localhost:5000') || url.includes('127.0.0.1:5000')) {
    return url.replace(/^https?:\/\/(localhost|127\.0\.0\.1):5000/, API_BASE);
  }
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:') || url.startsWith('data:')) {
    return url;
  }
  const cleanUrl = url.startsWith('/') ? url : `/${url}`;
  return `${API_BASE}${cleanUrl}`;
}

export default API;
