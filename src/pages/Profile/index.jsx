// pages/Profile/index.jsx
// Trang cá nhân người dùng — quản lý thông tin, đổi mật khẩu và xem/tải beats đã mua
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, Mail, ShieldAlert, KeyRound, Download, Play, Pause,
  Save, AlertCircle, CheckCircle, ArrowLeft, Headphones, ExternalLink,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

import { API } from '@/constants/api';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, token, isLoggedIn, updateProfile, changePassword } = useAuth();

  const [name, setName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [purchasedBeats, setPurchasedBeats] = useState([]);
  const [loadingBeats, setLoadingBeats] = useState(false);

  const [infoError, setInfoError] = useState('');
  const [infoSuccess, setInfoSuccess] = useState('');
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState('');
  const [savingInfo, setSavingInfo] = useState(false);
  const [savingPw, setSavingPw] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login');
    } else if (user) {
      setName(user.name);
      fetchPurchasedBeats();
    }
  }, [isLoggedIn, user, navigate]);

  // Fetch beats data to show details of unlocked tracks
  async function fetchPurchasedBeats() {
    setLoadingBeats(true);
    try {
      const res = await fetch(`${API}/tracks`);
      const data = await res.json();
      if (data.success && user?.unlockedTracks) {
        // Filter tracks that are in the user's unlocked list
        const unlockedIdsStr = user.unlockedTracks.map(String);
        const filtered = data.data.filter((t) => unlockedIdsStr.includes(String(t._id)));
        setPurchasedBeats(filtered);
      }
    } catch (err) {
      console.error('Không thể lấy danh sách beats:', err);
    }
    setLoadingBeats(false);
  }

  // Handle update profile info
  async function handleUpdateInfo(e) {
    e.preventDefault();
    setInfoError('');
    setInfoSuccess('');
    setSavingInfo(true);
    try {
      await updateProfile(name);
      setInfoSuccess('Đã cập nhật thông tin cá nhân!');
    } catch (err) {
      setInfoError(err.message);
    }
    setSavingInfo(false);
  }

  // Handle update password
  async function handleUpdatePassword(e) {
    e.preventDefault();
    setPwError('');
    setPwSuccess('');
    if (newPassword !== confirmPassword) {
      setPwError('Mật khẩu xác nhận không khớp');
      return;
    }
    setSavingPw(true);
    try {
      await changePassword(currentPassword, newPassword);
      setPwSuccess('Đã thay đổi mật khẩu thành công!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPwError(err.message);
    }
    setSavingPw(false);
  }

  if (!user) return null;

  const initials = user.name
    ? user.name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <div className="min-h-screen flex flex-col justify-between" style={{ background: '#07060d' }}>
      <Navbar />

      <main className="max-w-4xl w-full mx-auto px-6 pt-28 pb-16 flex-grow">
        {/* Back Button */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-white transition-colors mb-6">
          <ArrowLeft size={16} /> Quay lại trang chính
        </button>

        {/* Profile Card Header */}
        <div
          className="rounded-3xl p-6 sm:p-8 mb-8 flex flex-col sm:flex-row items-center gap-6"
          style={{
            background: 'linear-gradient(135deg, rgba(201,169,110,0.06) 0%, rgba(167,139,202,0.04) 100%)',
            border: '1px solid rgba(255,255,255,0.05)',
          }}>
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="w-20 h-20 rounded-2xl object-cover"
              style={{ border: '2px solid rgba(201,169,110,0.3)', boxShadow: '0 0 20px rgba(201,169,110,0.1)' }}
            />
          ) : (
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center font-display text-2xl font-bold"
              style={{
                background: 'linear-gradient(135deg, #a78bca, #7ab8a0)',
                color: '#fff',
                border: '2px solid rgba(255,255,255,0.1)',
                boxShadow: '0 0 20px rgba(167,139,202,0.2)',
              }}>
              {initials}
            </div>
          )}

          <div className="text-center sm:text-left">
            <h1 className="text-2xl font-bold text-white mb-1">{user.name}</h1>
            <p className="text-sm text-gray-500 mb-2">{user.email}</p>
            <div className="flex gap-2 justify-center sm:justify-start">
              <span
                className="text-[11px] px-2.5 py-0.5 rounded-full font-semibold uppercase tracking-wider"
                style={{
                  background: user.provider === 'local' ? 'rgba(201,169,110,0.15)' : 'rgba(167,139,202,0.15)',
                  color: user.provider === 'local' ? '#c9a96e' : '#a78bca',
                }}>
                Thành viên {user.provider === 'local' ? 'BAT Music' : `qua ${user.provider}`}
              </span>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-white/5 text-gray-400">
                Đã mua: {purchasedBeats.length} beats
              </span>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-5 gap-8">
          {/* Settings forms */}
          <div className="md:col-span-3 space-y-8">
            {/* Cập nhật thông tin */}
            <section
              className="p-6 rounded-2xl"
              style={{ background: 'rgba(21,18,28,0.5)', border: '1px solid rgba(255,255,255,0.04)' }}>
              <h2 className="font-grotesk text-lg font-bold text-white mb-4 flex items-center gap-2">
                <User size={18} className="text-gold" /> Thông tin cá nhân
              </h2>

              {infoError && (
                <div className="flex items-center gap-2 text-xs mb-4 p-3 rounded-xl"
                  style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.15)' }}>
                  <AlertCircle size={14} className="flex-shrink-0" /> {infoError}
                </div>
              )}
              {infoSuccess && (
                <div className="flex items-center gap-2 text-xs mb-4 p-3 rounded-xl"
                  style={{ background: 'rgba(122,184,160,0.1)', color: '#7ab8a0', border: '1px solid rgba(122,184,160,0.15)' }}>
                  <CheckCircle size={14} className="flex-shrink-0" /> {infoSuccess}
                </div>
              )}

              <form onSubmit={handleUpdateInfo} className="space-y-4">
                <div>
                  <label className="block text-xs text-gray-500 uppercase mb-1.5 font-medium">Email</label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-700">
                      <Mail size={16} />
                    </div>
                    <input
                      type="text"
                      disabled
                      value={user.email}
                      className="input-field pl-10 text-gray-600 cursor-not-allowed bg-black/10"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-gray-500 uppercase mb-1.5 font-medium">Họ và tên *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input-field"
                  />
                </div>

                <button
                  type="submit"
                  disabled={savingInfo}
                  className="px-5 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all"
                  style={{ background: 'linear-gradient(135deg, #c9a96e, #e8c98a)', color: '#07060d', opacity: savingInfo ? 0.7 : 1 }}>
                  <Save size={14} /> {savingInfo ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
              </form>
            </section>

            {/* Đổi mật khẩu (chỉ hiển thị nếu là local provider) */}
            {user.provider === 'local' && (
              <section
                className="p-6 rounded-2xl"
                style={{ background: 'rgba(21,18,28,0.5)', border: '1px solid rgba(255,255,255,0.04)' }}>
                <h2 className="font-grotesk text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <KeyRound size={18} className="text-violet" /> Đổi mật khẩu
                </h2>

                {pwError && (
                  <div className="flex items-center gap-2 text-xs mb-4 p-3 rounded-xl"
                    style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.15)' }}>
                    <AlertCircle size={14} className="flex-shrink-0" /> {pwError}
                  </div>
                )}
                {pwSuccess && (
                  <div className="flex items-center gap-2 text-xs mb-4 p-3 rounded-xl"
                    style={{ background: 'rgba(122,184,160,0.1)', color: '#7ab8a0', border: '1px solid rgba(122,184,160,0.15)' }}>
                    <CheckCircle size={14} className="flex-shrink-0" /> {pwSuccess}
                  </div>
                )}

                <form onSubmit={handleUpdatePassword} className="space-y-4">
                  <div>
                    <label className="block text-xs text-gray-500 uppercase mb-1.5 font-medium">Mật khẩu hiện tại</label>
                    <input
                      type="password"
                      required
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-gray-500 uppercase mb-1.5 font-medium">Mật khẩu mới</label>
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-gray-500 uppercase mb-1.5 font-medium">Xác nhận mật khẩu mới</label>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="input-field"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={savingPw}
                    className="px-5 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all"
                    style={{ background: 'linear-gradient(135deg, #a78bca, #8b6cb5)', color: '#fff', opacity: savingPw ? 0.7 : 1 }}>
                    <KeyRound size={14} /> {savingPw ? 'Đang cập nhật...' : 'Đổi mật khẩu'}
                  </button>
                </form>
              </section>
            )}
          </div>

          {/* Purchased Beats List */}
          <div className="md:col-span-2">
            <section
              className="p-6 rounded-2xl h-full flex flex-col"
              style={{ background: 'rgba(21,18,28,0.5)', border: '1px solid rgba(255,255,255,0.04)' }}>
              <h2 className="font-grotesk text-lg font-bold text-white mb-4 flex items-center justify-between">
                <span>🎵 Beats đã mua</span>
                <span className="text-xs font-mono text-gray-600 bg-white/5 px-2 py-0.5 rounded-full">
                  {purchasedBeats.length} bài
                </span>
              </h2>

              {loadingBeats ? (
                <div className="flex-grow flex items-center justify-center py-12 text-sm text-gray-500">
                  Đang tải danh sách...
                </div>
              ) : purchasedBeats.length === 0 ? (
                <div className="flex-grow flex flex-col items-center justify-center py-16 text-center">
                  <ShieldAlert size={36} className="text-gray-700 mb-2" />
                  <p className="text-xs text-gray-500">Bạn chưa mua hoặc mở khoá beat nào.</p>
                  <button
                    onClick={() => navigate('/')}
                    className="mt-3 text-xs font-semibold text-gold hover:underline">
                    Xem Beats & Store ↗
                  </button>
                </div>
              ) : (
                <div className="space-y-3 flex-grow overflow-y-auto max-h-[480px] pr-1">
                  {purchasedBeats.map((track) => (
                    <div
                      key={track._id}
                      className="p-3 rounded-xl flex items-center justify-between transition-all hover:bg-white/[0.02]"
                      style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.03)' }}>
                      <div className="min-w-0 flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center font-bold text-xs"
                          style={{
                            background: `linear-gradient(135deg, ${track.color}44, ${track.color}11)`,
                            color: track.color,
                            border: `1px solid ${track.color}22`,
                          }}>
                          {track.imageUrl ? (
                            <img src={track.imageUrl} alt="" className="w-full h-full object-cover rounded-lg" />
                          ) : (
                            track.title?.[0] || '♪'
                          )}
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-xs font-semibold text-gray-200 truncate">{track.title}</h3>
                          <p className="text-[10px] text-gray-600 truncate mt-0.5">{track.producer ?? 'BAT'}</p>
                        </div>
                      </div>

                      {/* Download link */}
                      {track.audioUrl && (
                        <a
                          href={`${API}/tracks/${track._id}/download`}
                          download={`${track.title}.mp3`}
                          onClick={(e) => {
                            // Fetch download through token since download routes need authentication
                            e.preventDefault();
                            fetch(`${API}/tracks/${track._id}/download`, {
                              headers: { Authorization: `Bearer ${token}` }
                            })
                            .then(response => {
                              if (response.ok) return response.blob();
                              throw new Error('Tải xuống thất bại');
                            })
                            .then(blob => {
                              const url = window.URL.createObjectURL(blob);
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = `${track.title || 'beat'}.mp3`;
                              document.body.appendChild(a);
                              a.click();
                              a.remove();
                              window.URL.revokeObjectURL(url);
                            })
                            .catch(err => alert(err.message));
                          }}
                          className="p-2 rounded-lg bg-green-500/10 hover:bg-green-500/20 text-[#7ab8a0] transition-all flex items-center justify-center hover:scale-105"
                          title="Tải Beat">
                          <Download size={14} />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
