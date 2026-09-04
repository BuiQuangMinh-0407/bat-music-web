// contexts/AuthContext.jsx
// Quản lý user state: login, register, social login, logout
import { createContext, useContext, useState, useEffect } from 'react';
import { API } from '@/constants/api';
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [token,   setToken]   = useState(() => localStorage.getItem('bat-token') || null);
  const [loading, setLoading] = useState(true);

  // ── Khôi phục session khi reload ────────────────────────────────────────────
  useEffect(() => {
    if (!token) { setLoading(false); return; }
    fetch(`${API}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setUser(data.user);
        else { localStorage.removeItem('bat-token'); setToken(null); }
      })
      .catch(() => { localStorage.removeItem('bat-token'); setToken(null); })
      .finally(() => setLoading(false));
  }, [token]);

  // ── Helpers ─────────────────────────────────────────────────────────────────
  function saveAuth(data) {
    localStorage.setItem('bat-token', data.token);
    setToken(data.token);
    setUser(data.user);
  }

  async function register(name, email, password) {
    const res  = await fetch(`${API}/auth/register`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    saveAuth(data);
    return data;
  }

  async function login(email, password) {
    const res  = await fetch(`${API}/auth/login`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    saveAuth(data);
    return data;
  }

  async function socialLogin({ name, email, avatar, provider, providerId }) {
    const res  = await fetch(`${API}/auth/social`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ name, email, avatar, provider, providerId }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    saveAuth(data);
    return data;
  }

  async function forgotPassword(email) {
    const res  = await fetch(`${API}/auth/forgot-password`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ email }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    return data;
  }

  async function resetPassword(email, code, newPassword) {
    const res  = await fetch(`${API}/auth/reset-password`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ email, code, newPassword }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    saveAuth(data);
    return data;
  }

  async function updateProfile(name, avatar) {
    const res  = await fetch(`${API}/auth/update`, {
      method:  'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body:    JSON.stringify({ name, avatar }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    setUser(data.user);
    return data;
  }

  async function changePassword(currentPassword, newPassword) {
    const res  = await fetch(`${API}/auth/change-password`, {
      method:  'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body:    JSON.stringify({ currentPassword, newPassword }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    return data;
  }

  async function googleLogin(dataOrCredential) {
    const body = typeof dataOrCredential === 'string'
      ? { credential: dataOrCredential }
      : dataOrCredential;

    const res = await fetch(`${API}/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    saveAuth(data);
    return data;
  }

  async function facebookLogin(dataOrToken) {
    const body = typeof dataOrToken === 'string'
      ? { accessToken: dataOrToken }
      : dataOrToken;

    const res = await fetch(`${API}/auth/facebook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    saveAuth(data);
    return data;
  }

  function logout() {
    localStorage.removeItem('bat-token');
    setToken(null);
    setUser(null);
  }

  const value = {
    user, token, loading,
    isLoggedIn: !!user,
    register, login, socialLogin,
    googleLogin, facebookLogin,
    forgotPassword, resetPassword, logout,
    updateProfile, changePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth phải dùng trong <AuthProvider>');
  return ctx;
}
