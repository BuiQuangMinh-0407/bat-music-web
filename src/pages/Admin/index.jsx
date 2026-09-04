// pages/Admin/index.jsx
// Trang quản trị chính — quản lý Beats, Khách hàng & Doanh thu, Tin nhắn & Yêu cầu Beat Custom
import { useState, useEffect } from 'react';
import {
  Plus, RefreshCw, Eye, LogOut, LayoutList, Music, Users, DollarSign, Lock, Star, Search, MessageSquare, Trash2, CheckCircle2, Clock
} from 'lucide-react';
import LoginScreen    from './LoginScreen';
import TrackForm      from './TrackForm';
import TrackTableRow  from './TrackTableRow';

import { API } from '@/constants/api';
const GENRES = ['All', 'R&B', 'Lo-Fi', 'Hip-Hop', 'Pop', 'Trap', 'Other'];

export default function AdminPage() {
  const [authed,    setAuthed]    = useState(!!sessionStorage.getItem('admin-token'));
  const [activeTab, setActiveTab] = useState('beats'); // 'beats' | 'users' | 'contacts'
  const [tracks,    setTracks]    = useState([]);
  const [users,     setUsers]     = useState([]);
  const [contacts,  setContacts]  = useState([]);
  const [stats,     setStats]     = useState({ totalUsers: 0, totalTracks: 0, totalUnlocks: 0, totalRevenue: 0 });
  const [loading,   setLoading]   = useState(false);
  const [showForm,  setShowForm]  = useState(false);
  const [editTrack, setEditTrack] = useState(null);
  const [filter,    setFilter]    = useState('All');
  const [search,    setSearch]    = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [contactSearch, setContactSearch] = useState('');
  const [dbStatus,  setDbStatus]  = useState('checking');

  const token = sessionStorage.getItem('admin-token');

  useEffect(() => {
    if (authed) {
      checkHealth();
      loadData();
    }
  }, [authed, activeTab]);

  async function checkHealth() {
    try {
      const res = await fetch(`${API}/health`);
      setDbStatus(res.ok ? 'connected' : 'error');
    } catch { setDbStatus('error'); }
  }

  async function loadData() {
    setLoading(true);
    try {
      if (activeTab === 'beats') {
        await fetchTracks();
      } else if (activeTab === 'users') {
        await fetchUsers();
        await fetchStats();
      } else if (activeTab === 'contacts') {
        await fetchContacts();
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }

  async function fetchTracks() {
    const res  = await fetch(`${API}/tracks`);
    const data = await res.json();
    if (data.success) setTracks(data.data);
  }

  async function fetchUsers() {
    const res = await fetch(`${API}/admin/users`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (data.success) setUsers(data.data);
  }

  async function fetchStats() {
    const res = await fetch(`${API}/admin/stats`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (data.success) setStats(data.stats);
  }

  async function fetchContacts() {
    const res = await fetch(`${API}/contact`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (data.success) setContacts(data.data);
  }

  async function handleUpdateContactStatus(id, newStatus) {
    try {
      const res = await fetch(`${API}/contact/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setContacts((prev) => prev.map((c) => (c._id === id ? data.data : c)));
      }
    } catch (err) {
      alert('Lỗi cập nhật trạng thái: ' + err.message);
    }
  }

  async function handleDeleteContact(id) {
    if (!window.confirm('Bạn có chắc muốn xóa tin nhắn này?')) return;
    try {
      const res = await fetch(`${API}/contact/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setContacts((prev) => prev.filter((c) => c._id !== id));
      }
    } catch (err) {
      alert('Lỗi xóa tin nhắn: ' + err.message);
    }
  }

  function handleLogout() {
    sessionStorage.removeItem('admin-token');
    setAuthed(false);
  }

  function handleSave(saved) {
    setTracks((prev) => {
      const idx = prev.findIndex((t) => t._id === saved._id);
      if (idx >= 0) { const a = [...prev]; a[idx] = saved; return a; }
      return [saved, ...prev];
    });
    setShowForm(false);
    setEditTrack(null);
  }

  function handleDelete(id) {
    setTracks((p) => p.filter((t) => t._id !== id));
  }
  function openAdd()       { setEditTrack(null); setShowForm(true); }
  function openEdit(track) { setEditTrack(track); setShowForm(true); }
  function closeForm()     { setShowForm(false); setEditTrack(null); }

  const displayedTracks = tracks.filter((t) => {
    const matchGenre  = filter === 'All' || t.genre === filter;
    const matchSearch = !search ||
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      (t.producer ?? '').toLowerCase().includes(search.toLowerCase());
    return matchGenre && matchSearch;
  });

  const displayedUsers = users.filter((u) => {
    return !userSearch ||
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase());
  });

  const displayedContacts = contacts.filter((c) => {
    return !contactSearch ||
      c.name.toLowerCase().includes(contactSearch.toLowerCase()) ||
      c.email.toLowerCase().includes(contactSearch.toLowerCase()) ||
      c.message.toLowerCase().includes(contactSearch.toLowerCase()) ||
      (c.phone || '').includes(contactSearch);
  });

  if (!authed) return <LoginScreen onLogin={() => setAuthed(true)} />;

  const statusStyle = dbStatus === 'connected'
    ? { background: 'rgba(122,184,160,0.12)', color: '#7ab8a0', border: '1px solid rgba(122,184,160,0.2)' }
    : { background: 'rgba(239,68,68,0.1)',    color: '#f87171', border: '1px solid rgba(239,68,68,0.2)'  };

  return (
    <div className="min-h-screen flex flex-col justify-between" style={{ background: '#08070a', color: '#e8e0d5' }}>
      <div>
        {/* Topbar */}
        <header className="glass sticky top-0 z-40 h-14" style={{ borderBottom: '1px solid rgba(201,169,110,0.1)' }}>
          <div className="max-w-7xl mx-auto h-full px-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center font-black text-xs"
                style={{ background: 'linear-gradient(135deg, #c9a96e, #e8c98a)', color: '#08070a' }}>
                BAT
              </div>
              <span className="font-bold text-gray-200">Admin Panel</span>

              <span className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full" style={statusStyle}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: dbStatus === 'connected' ? '#7ab8a0' : '#ef4444' }} />
                {dbStatus === 'connected' ? 'MongoDB' : dbStatus === 'checking' ? 'Đang kiểm tra...' : 'Mất kết nối'}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <a href="/" target="_blank" rel="noreferrer"
                className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5">
                <Eye size={13} /> Xem trang
              </a>
              <button id="logout-btn" onClick={handleLogout}
                className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-red-400 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-400/5">
                <LogOut size={13} /> Đăng xuất
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-5 py-8">
          {/* Navigation Tabs */}
          <div className="flex gap-2 mb-8 border-b border-white/5 pb-4 overflow-x-auto">
            <button
              onClick={() => setActiveTab('beats')}
              className="px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap"
              style={activeTab === 'beats'
                ? { background: 'rgba(201,169,110,0.15)', color: '#c9a96e', border: '1px solid rgba(201,169,110,0.3)' }
                : { color: '#6b6480' }
              }>
              <Music size={16} /> Quản lý Beats ({tracks.length})
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className="px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap"
              style={activeTab === 'users'
                ? { background: 'rgba(167,139,202,0.15)', color: '#a78bca', border: '1px solid rgba(167,139,202,0.3)' }
                : { color: '#6b6480' }
              }>
              <Users size={16} /> Khách hàng &amp; Doanh thu
            </button>
            <button
              onClick={() => setActiveTab('contacts')}
              className="px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap"
              style={activeTab === 'contacts'
                ? { background: 'rgba(122,184,160,0.15)', color: '#7ab8a0', border: '1px solid rgba(122,184,160,0.3)' }
                : { color: '#6b6480' }
              }>
              <MessageSquare size={16} /> Yêu cầu Custom &amp; Tin nhắn ({contacts.filter(c => c.status === 'new').length} mới)
            </button>
          </div>

          {activeTab === 'beats' ? (
            <>
              {/* Beats Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                {[
                  { label: 'Tổng Beats',  value: displayedTracks.length,                color: '#c9a96e' },
                  { label: 'Nổi Bật',     value: tracks.filter((t) => t.featured).length, color: '#e8c98a' },
                  { label: 'R&B',          value: tracks.filter((t) => t.genre === 'R&B').length, color: '#d4756b' },
                  { label: 'Lo-Fi',        value: tracks.filter((t) => t.genre === 'Lo-Fi').length, color: '#7ab8a0' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="p-4 rounded-2xl"
                    style={{ background: 'rgba(21,18,28,0.6)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div className="text-3xl font-black" style={{ color }}>{value}</div>
                    <div className="text-xs text-gray-600 mt-1">{label}</div>
                  </div>
                ))}
              </div>

              {/* Beats Toolbar */}
              <div className="flex flex-col sm:flex-row gap-3 mb-5">
                <input id="admin-search" value={search} onChange={(e) => setSearch(e.target.value)}
                  placeholder="Tìm kiếm beat..."
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm text-gray-300 placeholder-gray-700 outline-none"
                  style={{ background: 'rgba(21,18,28,0.7)', border: '1px solid rgba(255,255,255,0.07)' }} />

                <div className="flex gap-2 flex-wrap">
                  {GENRES.slice(0, 4).map((g) => (
                    <button key={g} onClick={() => setFilter(g)}
                      className="px-3 py-2 rounded-xl text-xs font-medium transition-all"
                      style={filter === g
                        ? { background: 'rgba(201,169,110,0.15)', color: '#c9a96e', border: '1px solid rgba(201,169,110,0.3)' }
                        : { color: '#6b6480', border: '1px solid rgba(255,255,255,0.07)' }}>
                      {g}
                    </button>
                  ))}
                </div>

                <button onClick={loadData} disabled={loading}
                  className="p-2.5 rounded-xl text-gray-500 hover:text-gray-300 transition-all hover:bg-white/5 border border-white/10">
                  <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                </button>

                <button id="add-track-btn" onClick={openAdd}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap"
                  style={{ background: 'linear-gradient(135deg, #c9a96e, #e8c98a)', color: '#08070a', boxShadow: '0 0 20px rgba(201,169,110,0.3)' }}>
                  <Plus size={16} /> Thêm Beat
                </button>
              </div>

              {/* Beats Table */}
              <div className="rounded-2xl overflow-hidden"
                style={{ background: 'rgba(21,18,28,0.5)', border: '1px solid rgba(255,255,255,0.05)' }}>

                <div className="flex items-center gap-2 px-5 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <LayoutList size={14} className="text-gray-600" />
                  <span className="text-sm font-semibold text-gray-400">{displayedTracks.length} beats</span>
                </div>

                {loading ? (
                  <div className="flex items-center justify-center py-20 gap-3 text-gray-600">
                    <RefreshCw size={20} className="animate-spin" /> Đang tải...
                  </div>
                ) : displayedTracks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-700">
                    <Music size={48} className="opacity-20" />
                    <p className="text-sm">Chưa có beat nào. Bấm "Thêm Beat" để bắt đầu!</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          {['Beat', 'Genre', 'BPM · Key', 'Thời lượng', 'Giá', 'Lượt nghe', 'Thao tác'].map((h) => (
                            <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {displayedTracks.map((track) => (
                          <TrackTableRow
                            key={track._id}
                            track={track}
                            onEdit={openEdit}
                            onDelete={handleDelete}
                          />
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          ) : activeTab === 'users' ? (
            <>
              {/* Users & Revenue Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                {[
                  { label: 'Tổng số Khách hàng', value: stats.totalUsers, color: '#a78bca', icon: <Users size={16} /> },
                  { label: 'Tổng số Beats', value: stats.totalTracks, color: '#7ab8a0', icon: <Music size={16} /> },
                  { label: 'Lượt mở khóa (Beat)', value: stats.totalUnlocks, color: '#e8c98a', icon: <Lock size={16} /> },
                  { label: 'Doanh thu dự tính', value: `${stats.totalRevenue.toLocaleString('vi-VN')} đ`, color: '#7ab8a0', icon: <DollarSign size={16} /> },
                ].map(({ label, value, color, icon }) => (
                  <div key={label} className="p-4 rounded-2xl flex flex-col justify-between"
                    style={{ background: 'rgba(21,18,28,0.6)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div>
                      <div className="text-3xl font-black" style={{ color }}>{value}</div>
                      <div className="text-xs text-gray-600 mt-1">{label}</div>
                    </div>
                    <div className="self-end mt-2 opacity-35" style={{ color }}>{icon}</div>
                  </div>
                ))}
              </div>

              {/* Users Toolbar */}
              <div className="flex gap-3 mb-5">
                <div className="relative flex-1">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600">
                    <Search size={15} />
                  </span>
                  <input
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder="Tìm kiếm khách hàng theo tên hoặc email..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-gray-300 placeholder-gray-700 outline-none"
                    style={{ background: 'rgba(21,18,28,0.7)', border: '1px solid rgba(255,255,255,0.07)' }}
                  />
                </div>
                <button onClick={loadData} disabled={loading}
                  className="p-2.5 rounded-xl text-gray-500 hover:text-gray-300 transition-all hover:bg-white/5 border border-white/10">
                  <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                </button>
              </div>

              {/* Users Table */}
              <div className="rounded-2xl overflow-hidden"
                style={{ background: 'rgba(21,18,28,0.5)', border: '1px solid rgba(255,255,255,0.05)' }}>

                <div className="flex items-center gap-2 px-5 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <Users size={14} className="text-gray-600" />
                  <span className="text-sm font-semibold text-gray-400">{displayedUsers.length} khách hàng</span>
                </div>

                {loading ? (
                  <div className="flex items-center justify-center py-20 gap-3 text-gray-600">
                    <RefreshCw size={20} className="animate-spin" /> Đang tải...
                  </div>
                ) : displayedUsers.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-700">
                    <Users size={48} className="opacity-20" />
                    <p className="text-sm">Chưa có người dùng nào đăng ký.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          {['Khách hàng', 'Email', 'Nhà cung cấp', 'Ngày tham gia', 'Beats đã mua'].map((h) => (
                            <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {displayedUsers.map((u) => (
                          <tr key={u._id} className="border-b transition-colors hover:bg-white/[0.02]" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                            <td className="px-4 py-3 text-sm font-semibold text-gray-200">{u.name}</td>
                            <td className="px-4 py-3 text-sm text-gray-400">{u.email}</td>
                            <td className="px-4 py-3 text-xs text-gray-500">
                              <span className="px-2 py-0.5 rounded-full capitalize" style={{
                                background: u.provider === 'local' ? 'rgba(201,169,110,0.1)' : 'rgba(167,139,202,0.1)',
                                color: u.provider === 'local' ? '#c9a96e' : '#a78bca',
                              }}>
                                {u.provider}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-xs text-gray-400">
                              {new Date(u.createdAt).toLocaleDateString('vi-VN')}
                            </td>
                            <td className="px-4 py-3 text-xs text-gray-300">
                              <div className="max-w-xs truncate" title={u.unlockedTracks?.map(t => t.title).join(', ')}>
                                {u.unlockedTracks && u.unlockedTracks.length > 0 ? (
                                  <span className="font-semibold text-gold">
                                    {u.unlockedTracks.length} bài ({u.unlockedTracks.map(t => t.title).join(', ')})
                                  </span>
                                ) : (
                                  <span className="text-gray-600">Chưa mua bài nào</span>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              {/* Contacts & Custom Beat Requests Tab */}
              <div className="flex gap-3 mb-5">
                <div className="relative flex-1">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600">
                    <Search size={15} />
                  </span>
                  <input
                    value={contactSearch}
                    onChange={(e) => setContactSearch(e.target.value)}
                    placeholder="Tìm theo tên khách, email, SĐT hoặc nội dung yêu cầu..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-gray-300 placeholder-gray-700 outline-none"
                    style={{ background: 'rgba(21,18,28,0.7)', border: '1px solid rgba(255,255,255,0.07)' }}
                  />
                </div>
                <button onClick={loadData} disabled={loading}
                  className="p-2.5 rounded-xl text-gray-500 hover:text-gray-300 transition-all hover:bg-white/5 border border-white/10">
                  <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                </button>
              </div>

              <div className="rounded-2xl overflow-hidden"
                style={{ background: 'rgba(21,18,28,0.5)', border: '1px solid rgba(255,255,255,0.05)' }}>

                <div className="flex items-center gap-2 px-5 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <MessageSquare size={14} className="text-gray-600" />
                  <span className="text-sm font-semibold text-gray-400">{displayedContacts.length} tin nhắn &amp; yêu cầu</span>
                </div>

                {loading ? (
                  <div className="flex items-center justify-center py-20 gap-3 text-gray-600">
                    <RefreshCw size={20} className="animate-spin" /> Đang tải...
                  </div>
                ) : displayedContacts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-700">
                    <MessageSquare size={48} className="opacity-20" />
                    <p className="text-sm">Chưa có yêu cầu hay tin nhắn nào từ khách hàng.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          {['Khách hàng', 'Liên hệ', 'Loại yêu cầu', 'Ngân sách', 'Nội dung tin nhắn', 'Thời gian', 'Trạng thái', 'Xóa'].map((h) => (
                            <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {displayedContacts.map((c) => (
                          <tr key={c._id} className="border-b transition-colors hover:bg-white/[0.02]" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                            <td className="px-4 py-3 text-sm font-semibold text-gray-200">{c.name}</td>
                            <td className="px-4 py-3 text-xs text-gray-400">
                              <div>{c.email}</div>
                              {c.phone && <div className="text-gold mt-0.5">{c.phone}</div>}
                            </td>
                            <td className="px-4 py-3 text-xs text-gray-300">
                              <span className="px-2 py-0.5 rounded-full bg-white/5 text-gray-300">
                                {c.type === 'custom-beat' ? '🎵 Custom Beat' : c.type === 'license' ? '📜 Bản quyền' : c.type === 'collab' ? '🤝 Hợp tác' : '💬 Khác'}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-xs font-bold text-gold">
                              {c.budget || 'Chưa rõ'}
                            </td>
                            <td className="px-4 py-3 text-xs text-gray-300 max-w-xs">
                              <div className="line-clamp-2" title={c.message}>{c.message}</div>
                            </td>
                            <td className="px-4 py-3 text-[11px] text-gray-500 whitespace-nowrap">
                              {new Date(c.createdAt).toLocaleString('vi-VN')}
                            </td>
                            <td className="px-4 py-3 text-xs">
                              <select
                                value={c.status}
                                onChange={(e) => handleUpdateContactStatus(c._id, e.target.value)}
                                className="px-2 py-1 rounded-lg text-xs font-semibold outline-none cursor-pointer"
                                style={{
                                  background: c.status === 'new' ? 'rgba(239,68,68,0.15)' : c.status === 'contacted' ? 'rgba(201,169,110,0.15)' : 'rgba(122,184,160,0.15)',
                                  color: c.status === 'new' ? '#f87171' : c.status === 'contacted' ? '#c9a96e' : '#7ab8a0',
                                  border: '1px solid rgba(255,255,255,0.1)',
                                }}>
                                <option value="new" className="bg-[#15121c] text-red-400">Mới</option>
                                <option value="contacted" className="bg-[#15121c] text-yellow-400">Đã liên hệ</option>
                                <option value="completed" className="bg-[#15121c] text-green-400">Hoàn thành</option>
                                <option value="cancelled" className="bg-[#15121c] text-gray-500">Hủy bỏ</option>
                              </select>
                            </td>
                            <td className="px-4 py-3 text-xs">
                              <button
                                onClick={() => handleDeleteContact(c._id)}
                                className="p-1.5 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                                title="Xóa tin nhắn">
                                <Trash2 size={14} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </main>
      </div>

      <footer className="py-6 px-5 text-center text-xs text-gray-700" style={{ borderTop: '1px solid rgba(255,255,255,0.03)' }}>
        Admin Panel — BAT Music · Dữ liệu thời gian thực MongoDB Atlas
      </footer>

      {/* Form modal */}
      {showForm && (
        <TrackForm
          initial={editTrack}
          onSave={handleSave}
          onCancel={closeForm}
        />
      )}
    </div>
  );
}
