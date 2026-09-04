// constants/api.js
// Tự động nhận diện URL API: chạy local hoặc chạy trên mạng (Vercel / Render)
const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const API_BASE = BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

/**
 * Chuyển đổi đường dẫn tương đối (/uploads/...) thành URL đầy đủ
 */
export function getMediaUrl(url) {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:') || url.startsWith('data:')) {
    return url;
  }
  const cleanUrl = url.startsWith('/') ? url : `/${url}`;
  return `${API_BASE}${cleanUrl}`;
}

export default API;
