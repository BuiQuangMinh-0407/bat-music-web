// pages/Admin/LoginScreen.jsx
import { useState } from 'react';
import { AlertCircle } from 'lucide-react';

import { API } from '@/constants/api';

export default function LoginScreen({ onLogin }) {
  const [pw,      setPw]      = useState('');
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res  = await fetch(`${API}/admin/login`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ password: pw }),
      });
      const data = await res.json();
      if (data.success) {
        sessionStorage.setItem('admin-token', data.token);
        onLogin();
      } else {
        setError('Sai mật khẩu. Thử lại!');
      }
    } catch {
      setError('Không kết nối được server. Hãy chắc chắn server đang chạy (port 5000).');
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#08070a' }}>
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div
            className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center font-black text-xl"
            style={{ background: 'linear-gradient(135deg, #c9a96e, #e8c98a)', color: '#08070a' }}>
            BAT
          </div>
          <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
          <p className="text-gray-600 text-sm mt-1">Đăng nhập để quản trị</p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="p-6 rounded-2xl"
          style={{ background: 'rgba(21,18,28,0.9)', border: '1px solid rgba(201,169,110,0.15)' }}>

          <label className="block text-xs text-gray-600 uppercase tracking-wider mb-1.5">
            Mật khẩu
          </label>
          <input
            id="admin-password"
            type="password"
            required
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            placeholder="Nhập mật khẩu admin..."
            className="input-field mb-4"
          />

          {error && (
            <div
              className="flex items-center gap-2 text-red-400 text-sm mb-4 p-3 rounded-lg"
              style={{ background: 'rgba(239,68,68,0.1)' }}>
              <AlertCircle size={14} /> {error}
            </div>
          )}

          <button
            id="login-submit"
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-bold text-sm transition-all"
            style={{ background: 'linear-gradient(135deg, #c9a96e, #e8c98a)', color: '#08070a', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Đang kiểm tra...' : 'Đăng nhập'}
          </button>
        </form>

        <p className="text-center mt-4">
          <a href="/" className="text-gray-600 text-sm hover:text-brand transition-colors">
            ← Về trang chính
          </a>
        </p>
      </div>
    </div>
  );
}
