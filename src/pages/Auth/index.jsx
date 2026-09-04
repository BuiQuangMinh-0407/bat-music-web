// pages/Auth/index.jsx
// Giao diện "Login Lamp" Đèn Bàn Nghệ Thuật — Bật đèn để đăng nhập & đăng ký
// Hỗ trợ: Đăng ký thường (MongoDB/Bcrypt), Đăng nhập thường, Google (Gmail), Facebook & Quên mật khẩu
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Mail, Lock, User, Eye, EyeOff, ArrowRight,
  AlertCircle, CheckCircle, KeyRound, Sparkles, ArrowLeft,
} from 'lucide-react';
import { gsap } from 'gsap';
import { useAuth } from '@/contexts/AuthContext';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

/* ── SVG Icons ─────────────────────────────────────────────────────────────── */
function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A11.96 11.96 0 0 0 0 12c0 1.94.46 3.77 1.28 5.41l3.56-2.76-.01-.56z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="#1877F2">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  );
}

/* ── Desk Lamp SVG (Đèn bàn kéo sáng) ──────────────────────────────────────── */
function DeskLamp({ isOn, onClick }) {
  return (
    <div
      className="cursor-pointer select-none transition-transform duration-200 hover:scale-105 active:scale-95"
      onClick={onClick}
      title={isOn ? 'Click để tắt đèn' : 'Click để bật đèn đăng nhập'}
      style={{ width: 190, margin: '0 auto' }}>
      <svg viewBox="0 0 200 280" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Ánh sáng hình nón */}
        <defs>
          <linearGradient id="lampLightGrad" x1="100" y1="140" x2="100" y2="280" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor={isOn ? '#c9a96e' : 'transparent'} stopOpacity={isOn ? 0.35 : 0} />
            <stop offset="100%" stopColor={isOn ? '#c9a96e' : 'transparent'} stopOpacity={0} />
          </linearGradient>
          <radialGradient id="lampBulbGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={isOn ? '#ffe4a0' : '#444'} stopOpacity={isOn ? 1 : 0.3} />
            <stop offset="100%" stopColor={isOn ? '#c9a96e' : '#333'} stopOpacity={0} />
          </radialGradient>
        </defs>

        {/* Light cone */}
        <polygon
          points="70,140 130,140 160,280 40,280"
          fill="url(#lampLightGrad)"
          style={{ transition: 'all 0.6s ease' }}
        />

        {/* Lamp shade / Chụp đèn */}
        <path
          d="M60 130 Q60 110 100 108 Q140 110 140 130 Z"
          fill={isOn ? '#c9a96e' : '#4a4458'}
          style={{ transition: 'fill 0.4s ease' }}
        />
        {/* Shade bottom rim */}
        <ellipse cx="100" cy="131" rx="42" ry="5"
          fill={isOn ? '#b89860' : '#3a3450'}
          style={{ transition: 'fill 0.4s ease' }}
        />

        {/* Bulb glow */}
        <circle cx="100" cy="138" r="12" fill="url(#lampBulbGlow)"
          style={{ transition: 'all 0.4s ease' }} />

        {/* Stem / Thân đèn */}
        <rect x="96" y="60" width="8" height="70" rx="4"
          fill={isOn ? '#d4c4a0' : '#3a3450'}
          style={{ transition: 'fill 0.4s ease' }}
        />

        {/* Base / Đế đèn */}
        <ellipse cx="100" cy="60" rx="30" ry="8"
          fill={isOn ? '#b89860' : '#2e2940'}
          style={{ transition: 'fill 0.4s ease' }}
        />
        <ellipse cx="100" cy="56" rx="24" ry="5"
          fill={isOn ? '#c9a96e' : '#3a3450'}
          style={{ transition: 'fill 0.4s ease' }}
        />
      </svg>
    </div>
  );
}

/* ── Input Component ─────────────────────────────────────────────────────── */
function Input({ id, icon: Icon, type = 'text', placeholder, value, onChange, showToggle, required = true }) {
  const [show, setShow] = useState(false);
  const inputType = showToggle ? (show ? 'text' : 'password') : type;

  return (
    <div className="relative">
      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#6b6480' }}>
        <Icon size={15} />
      </div>
      <input
        id={id}
        type={inputType}
        required={required}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full pl-10 pr-9 py-2.5 rounded-xl text-xs sm:text-sm text-gray-200 placeholder-gray-600 outline-none transition-all"
        style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
        onFocus={(e) => (e.target.style.borderColor = 'rgba(201,169,110,0.5)')}
        onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.08)')}
      />
      {showToggle && (
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setShow((s) => !s)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 p-0.5">
          {show ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
      )}
    </div>
  );
}

const TABS = [
  { id: 'login',    label: 'Đăng Nhập', color: '#c9a96e' },
  { id: 'register', label: 'Đăng Ký',   color: '#7ab8a0' },
  { id: 'forgot',   label: 'Quên MK',   color: '#a78bca' },
];

export default function AuthPage() {
  const navigate = useNavigate();
  const { login, register, googleLogin, facebookLogin, socialLogin, forgotPassword, resetPassword, isLoggedIn } = useAuth();

  const [isOn, setIsOn] = useState(true); // Đèn bật sẵn mặc định
  const [tab, setTab] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetStep, setResetStep] = useState(1);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [socialModal, setSocialModal] = useState(null); // 'google' | 'facebook' | null
  const [socialInput, setSocialInput] = useState('');

  const formRef = useRef(null);
  const pageRef = useRef(null);
  
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  // Chuyển về home nếu đã đăng nhập
  useEffect(() => {
    if (isLoggedIn) {
      navigate('/');
    }
  }, [isLoggedIn, navigate]);

  // GSAP hiệu ứng đèn bật/tắt
  useEffect(() => {
    if (isOn) {
      gsap.to(formRef.current, { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: 'power2.out' });
      gsap.to(pageRef.current, { backgroundColor: '#07060d', duration: 0.5 });
    } else {
      gsap.to(formRef.current, { opacity: 0, y: 20, scale: 0.96, duration: 0.35, ease: 'power2.in' });
      gsap.to(pageRef.current, { backgroundColor: '#030206', duration: 0.4 });
    }
  }, [isOn]);

  function toggleLamp() {
    setIsOn((v) => !v);
  }

  function clearMessages() {
    setError('');
    setSuccess('');
  }

  function switchTab(newTab) {
    clearMessages();
    setTab(newTab);
    if (newTab === 'forgot') setResetStep(1);
  }

  function handleAuthSuccess() {
    navigate('/');
  }

  // ── Đăng nhập thường ────────────────────────────────────────────────────
  async function handleLogin(e) {
    e.preventDefault();
    clearMessages();
    setLoading(true);

    try {
      await login(email, password);
      setSuccess('Đăng nhập thành công!');
      setTimeout(handleAuthSuccess, 800);
    } catch (err) {
      setError(err.message || 'Sai email hoặc mật khẩu');
    }
    setLoading(false);
  }

  // ── Đăng ký thường ──────────────────────────────────────────────────────
  async function handleRegister(e) {
    e.preventDefault();
    clearMessages();

    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }
    if (password.length < 6) {
      setError('Mật khẩu tối thiểu 6 ký tự');
      return;
    }

    setLoading(true);
    try {
      await register(name, email, password);
      setSuccess('Đăng ký tài khoản thành công!');
      setTimeout(handleAuthSuccess, 800);
    } catch (err) {
      setError(err.message || 'Đăng ký thất bại. Email có thể đã tồn tại.');
    }
    setLoading(false);
  }

  // ── Quên mật khẩu ───────────────────────────────────────────────────────
  async function handleForgot(e) {
    e.preventDefault();
    clearMessages();
    setLoading(true);

    try {
      if (resetStep === 1) {
        const data = await forgotPassword(email);
        setSuccess('Mã xác nhận đã gửi đến email của bạn!');
        setResetStep(2);
        if (data.code) setSuccess(`Mã xác nhận: ${data.code}`);
      } else if (resetStep === 2) {
        if (!resetCode || resetCode.length < 6) {
          setError('Vui lòng nhập đủ mã xác nhận');
          setLoading(false);
          return;
        }
        setResetStep(3);
        setSuccess('Mã hợp lệ. Nhập mật khẩu mới.');
      } else if (resetStep === 3) {
        if (newPassword.length < 6) {
          setError('Mật khẩu mới tối thiểu 6 ký tự');
          setLoading(false);
          return;
        }
        await resetPassword(email, resetCode, newPassword);
        setSuccess('Đổi mật khẩu thành công!');
        setTimeout(() => switchTab('login'), 1200);
      }
    } catch (err) {
      setError(err.message || 'Thao tác thất bại');
    }
    setLoading(false);
  }

  // ── Đăng nhập Google Official ────────────────────────────────────────────
  async function handleGoogleSuccess(credentialResponse) {
    clearMessages();
    setLoading(true);
    try {
      await googleLogin({ credential: credentialResponse.credential });
      setSuccess('Đăng nhập Google thành công!');
      setTimeout(handleAuthSuccess, 800);
    } catch (err) {
      setError(err.message || 'Lỗi đăng nhập Google');
    }
    setLoading(false);
  }

  // ── Đăng nhập Google / Facebook qua Backend ────────────────────────────
  async function handleSocialSubmit(provider, customEmail = '') {
    clearMessages();
    setLoading(true);
    setSocialModal(null);

    const userEmail = customEmail || (provider === 'google' ? 'user@gmail.com' : 'user@facebook.com');
    const userName = userEmail.split('@')[0].toUpperCase();

    try {
      if (provider === 'google') {
        await googleLogin({
          email: userEmail,
          name: userName || 'Google User',
          avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${userEmail}`,
        });
      } else {
        await facebookLogin({
          email: userEmail,
          name: userName || 'Facebook User',
          avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${userEmail}`,
        });
      }
      setSuccess(`Đăng nhập qua ${provider === 'google' ? 'Google' : 'Facebook'} thành công!`);
      setTimeout(handleAuthSuccess, 800);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  }

  const activeTab = TABS.find((t) => t.id === tab);

  const authContent = (
    <div
      ref={pageRef}
      className="min-h-screen flex flex-col items-center justify-center px-4 py-8 relative overflow-hidden transition-colors duration-500"
      style={{ backgroundColor: '#07060d' }}>

      {/* Back to Home button */}
      <button
        onClick={() => navigate('/')}
        className="absolute top-6 left-6 flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-white transition-colors py-2 px-3 rounded-xl bg-white/5 border border-white/5 z-20">
        <ArrowLeft size={14} /> Trang chủ
      </button>

      {/* Header */}
      <h1
        className="font-display text-3xl sm:text-4xl text-center mb-1 transition-colors duration-500"
        style={{ color: isOn ? '#c9a96e' : '#3a3450' }}>
        Login Lamp
      </h1>
      <p
        className="text-xs text-center mb-4 tracking-widest uppercase transition-colors duration-500"
        style={{ color: isOn ? 'rgba(201,169,110,0.6)' : '#2e2940' }}>
        {isOn ? 'Bấm vào đèn để tắt/bật' : 'Nhấn vào đèn để bật sáng'}
      </p>

      {/* Lamp SVG */}
      <DeskLamp isOn={isOn} onClick={toggleLamp} />

      {/* Form — xuất hiện theo ánh sáng đèn */}
      <div
        ref={formRef}
        className="w-full max-w-sm mt-2 transition-all relative z-10"
        style={{ opacity: isOn ? 1 : 0, pointerEvents: isOn ? 'auto' : 'none' }}>

        {/* Card */}
        <div
          className="rounded-3xl overflow-hidden shadow-2xl"
          style={{
            background: 'rgba(17,15,26,0.92)',
            backdropFilter: 'blur(16px)',
            border: `1px solid ${activeTab.color}25`,
            boxShadow: isOn ? `0 20px 60px rgba(0,0,0,0.6), 0 0 40px ${activeTab.color}15` : 'none',
          }}>

          {/* Colored top line */}
          <div
            className="h-[2px]"
            style={{ background: `linear-gradient(90deg, transparent, ${activeTab.color}, transparent)` }}
          />

          {/* Tab switcher */}
          <div className="flex p-1 mx-4 mt-4 rounded-xl" style={{ background: 'rgba(0,0,0,0.35)' }}>
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => switchTab(t.id)}
                className="flex-1 py-2 rounded-lg text-[11px] font-bold tracking-wide transition-all"
                style={
                  tab === t.id
                    ? { background: `${t.color}18`, color: t.color, border: `1px solid ${t.color}30` }
                    : { color: '#6b6480' }
                }>
                {t.label}
              </button>
            ))}
          </div>

          <div className="p-6 pt-4">
            {/* Messages */}
            {error && (
              <div
                className="flex items-center gap-2 text-xs mb-3 p-2.5 rounded-xl"
                style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.15)' }}>
                <AlertCircle size={14} className="flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div
                className="flex items-center gap-2 text-xs mb-3 p-2.5 rounded-xl"
                style={{ background: 'rgba(122,184,160,0.1)', color: '#7ab8a0', border: '1px solid rgba(122,184,160,0.15)' }}>
                <CheckCircle size={14} className="flex-shrink-0" />
                <span>{success}</span>
              </div>
            )}

            {/* ─── LOGIN ─────────────────────────────────────────────── */}
            {tab === 'login' && (
              <form onSubmit={handleLogin} className="space-y-3.5">
                <Input
                  id="l-e"
                  icon={Mail}
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Input
                  id="l-p"
                  icon={Lock}
                  type="password"
                  placeholder="Mật khẩu"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  showToggle
                />

                <div className="flex items-center justify-between text-[11px]">
                  <label className="flex items-center gap-1.5 cursor-pointer text-gray-500">
                    <input type="checkbox" className="w-3 h-3 rounded accent-[#c9a96e]" /> Nhớ tôi
                  </label>
                  <button
                    type="button"
                    onClick={() => switchTab('forgot')}
                    className="hover:underline text-xs"
                    style={{ color: '#a78bca' }}>
                    Quên mật khẩu?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg"
                  style={{
                    background: 'linear-gradient(135deg, #c9a96e, #e8c98a)',
                    color: '#07060d',
                    opacity: loading ? 0.7 : 1,
                  }}>
                  {loading ? 'Đang đăng nhập...' : <><ArrowRight size={15} /> Đăng nhập</>}
                </button>
              </form>
            )}

            {/* ─── REGISTER ──────────────────────────────────────────── */}
            {tab === 'register' && (
              <form onSubmit={handleRegister} className="space-y-3">
                <Input
                  id="r-n"
                  icon={User}
                  placeholder="Họ và tên"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <Input
                  id="r-e"
                  icon={Mail}
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Input
                  id="r-p"
                  icon={Lock}
                  type="password"
                  placeholder="Mật khẩu (6+ ký tự)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  showToggle
                />
                <Input
                  id="r-c"
                  icon={Lock}
                  type="password"
                  placeholder="Xác nhận mật khẩu"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  showToggle
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                  style={{
                    background: 'linear-gradient(135deg, #7ab8a0, #5fa88e)',
                    color: '#07060d',
                    opacity: loading ? 0.7 : 1,
                  }}>
                  {loading ? 'Đang tạo tài khoản...' : <><CheckCircle size={15} /> Tạo tài khoản</>}
                </button>
              </form>
            )}

            {/* ─── FORGOT PASSWORD ───────────────────────────────────── */}
            {tab === 'forgot' && (
              <form onSubmit={handleForgot} className="space-y-3">
                {resetStep === 1 && (
                  <>
                    <p className="text-xs text-gray-500 mb-1">Nhập email để nhận mã xác thực.</p>
                    <Input
                      id="f-e"
                      icon={Mail}
                      type="email"
                      placeholder="Email tài khoản"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </>
                )}
                {resetStep === 2 && (
                  <>
                    <p className="text-xs text-gray-500">
                      Nhập mã 6 số gửi đến <strong style={{ color: '#c9a96e' }}>{email}</strong>
                    </p>
                    <Input
                      id="f-c"
                      icon={KeyRound}
                      placeholder="Mã xác nhận (6 số)"
                      value={resetCode}
                      onChange={(e) => setResetCode(e.target.value)}
                    />
                  </>
                )}
                {resetStep === 3 && (
                  <>
                    <p className="text-xs text-gray-500">Nhập mật khẩu mới.</p>
                    <Input
                      id="f-n"
                      icon={Lock}
                      type="password"
                      placeholder="Mật khẩu mới (6+ ký tự)"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      showToggle
                    />
                  </>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                  style={{
                    background: 'linear-gradient(135deg, #a78bca, #8b6cb5)',
                    color: '#ffffff',
                    opacity: loading ? 0.7 : 1,
                  }}>
                  {loading
                    ? 'Đang xử lý...'
                    : resetStep === 1
                    ? 'Gửi mã xác nhận'
                    : resetStep === 2
                    ? 'Xác nhận mã'
                    : 'Đổi mật khẩu'}
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => switchTab('login')}
                    className="text-xs text-gray-500 hover:text-white transition-colors">
                    ← Quay lại Đăng nhập
                  </button>
                </div>
              </form>
            )}

            {/* ── Social Login Buttons ──────────────────────────────── */}
            {tab !== 'forgot' && (
              <>
                <div className="flex items-center gap-2 my-4">
                  <div className="flex-1 h-px bg-white/10" />
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider">hoặc đăng nhập nhanh</span>
                  <div className="flex-1 h-px bg-white/10" />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {googleClientId ? (
                    <div className="flex justify-center items-center h-full">
                      <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={() => setError('Đăng nhập Google thất bại')}
                      />
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setSocialModal('google')}
                      className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/5 transition-all">
                      <GoogleIcon /> Google
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setSocialModal('facebook')}
                    className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold bg-[#1877F2]/10 hover:bg-[#1877F2]/20 text-[#1877F2] border border-[#1877F2]/20 transition-all">
                    <FacebookIcon /> Facebook
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Footer text */}
        <p className="text-center text-[11px] text-gray-600 mt-4">
          Tài khoản dùng để nghe &amp; tải các beat đã mua vĩnh viễn
        </p>
      </div>

      {/* Social Login Modal Prompt */}
      {socialModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div
            className="w-full max-w-sm rounded-3xl p-6 relative"
            style={{ background: '#15121c', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div className="flex items-center gap-3 mb-4">
              {socialModal === 'google' ? <GoogleIcon /> : <FacebookIcon />}
              <h3 className="font-bold text-white text-base">
                Đăng nhập với {socialModal === 'google' ? 'Google / Gmail' : 'Facebook'}
              </h3>
            </div>
            <p className="text-xs text-gray-400 mb-4">
              Nhập email {socialModal === 'google' ? 'Gmail' : 'Facebook'} của bạn để đồng bộ tài khoản:
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSocialSubmit(socialModal, socialInput);
              }}
              className="space-y-3">
              <input
                type="email"
                required
                placeholder={socialModal === 'google' ? 'tenban@gmail.com' : 'tenban@facebook.com'}
                value={socialInput}
                onChange={(e) => setSocialInput(e.target.value)}
                className="input-field"
                autoFocus
              />

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSocialModal(null)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-gray-400 bg-white/5 hover:bg-white/10 transition-all">
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold transition-all text-black"
                  style={{
                    background: socialModal === 'google' ? '#ffffff' : '#1877F2',
                    color: socialModal === 'google' ? '#000000' : '#ffffff',
                  }}>
                  {loading ? 'Đang kết nối...' : 'Tiếp tục'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  if (googleClientId) {
    return (
      <GoogleOAuthProvider clientId={googleClientId}>
        {authContent}
      </GoogleOAuthProvider>
    );
  }

  return authContent;
}
