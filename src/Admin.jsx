import React, { useState, useEffect, useRef } from 'react';
import {
  Plus, Trash2, Edit2, Save, X, Upload, Music,
  Image, Link2, LogOut, Check, AlertCircle, RefreshCw,
  ChevronDown, Eye, Star, LayoutList
} from 'lucide-react';

const API = 'http://localhost:5000/api';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toast(msg, type = 'success') {
  const el = document.createElement('div');
  el.textContent = msg;
  el.style.cssText = `
    position:fixed; bottom:24px; right:24px; z-index:9999;
    padding:12px 20px; border-radius:12px; font-size:14px; font-weight:600;
    color:white; animation: fadeUp .3s ease;
    background: ${type === 'success' ? 'linear-gradient(135deg,#c9a96e,#e8c98a)' : '#ef4444'};
    color: ${type === 'success' ? '#08070a' : 'white'};
    box-shadow: 0 8px 24px rgba(0,0,0,0.4);
  `;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 3000);
}

const EMPTY_FORM = {
  title: '', producer: 'BAT', genre: 'R&B', bpm: 90,
  key: 'Am', duration: '3:00', price: 29.99,
  tags: '', imageUrl: '', audioUrl: '', audioType: 'url',
  color: '#c9a96e', featured: false, plays: '0',
};

const GENRES    = ['R&B', 'Lo-Fi', 'Hip-Hop', 'Pop', 'Trap', 'Other'];
const KEY_LIST  = ['Am','Cm','Dm','Em','Fm','Gm','Amaj','Cmaj','Dmaj','Emaj','Fmaj','Gmaj','Bbmaj','Ebm','F#m','C#m','Bb'];
const COLORS    = ['#c9a96e','#d4756b','#7ab8a0','#a78bca','#74b8d4','#e8a09a','#d4a574','#b07aa0'];

// ─── Login Screen ─────────────────────────────────────────────────────────────

function LoginScreen({ onLogin }) {
  const [pw, setPw]         = useState('');
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res  = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pw }),
      });
      const data = await res.json();
      if (data.success) {
        sessionStorage.setItem('admin-token', data.token);
        onLogin();
      } else {
        setError('Sai mật khẩu. Thử lại!');
      }
    } catch {
      setError('Không kết nối được server. Hãy chắc chắn server đang chạy.');
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#08070a' }}>
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center font-black text-xl"
            style={{ background: 'linear-gradient(135deg, #c9a96e, #e8c98a)', color: '#08070a' }}>
            BAT
          </div>
          <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
          <p className="text-gray-600 text-sm mt-1">Đăng nhập để quản trị</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 rounded-2xl" style={{ background: 'rgba(21,18,28,0.9)', border: '1px solid rgba(201,169,110,0.15)' }}>
          <label className="block text-xs text-gray-600 uppercase tracking-wider mb-1.5">Mật khẩu</label>
          <input
            id="admin-password"
            type="password" value={pw} required
            onChange={e => setPw(e.target.value)}
            placeholder="Nhập mật khẩu admin..."
            className="w-full px-4 py-3 rounded-xl text-sm text-gray-200 placeholder-gray-700 outline-none mb-4"
            style={{ background: 'rgba(28,24,38,0.8)', border: '1px solid rgba(255,255,255,0.07)' }}
            onFocus={e => e.target.style.borderColor = 'rgba(201,169,110,0.4)'}
            onBlur={e  => e.target.style.borderColor = 'rgba(255,255,255,0.07)'}
          />

          {error && (
            <div className="flex items-center gap-2 text-red-400 text-sm mb-4 p-3 rounded-lg" style={{ background: 'rgba(239,68,68,0.1)' }}>
              <AlertCircle size={14} /> {error}
            </div>
          )}

          <button id="login-submit" type="submit" disabled={loading}
            className="w-full py-3 rounded-xl font-bold text-sm transition-all"
            style={{ background: 'linear-gradient(135deg, #c9a96e, #e8c98a)', color: '#08070a', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Đang kiểm tra...' : 'Đăng nhập'}
          </button>
        </form>

        <p className="text-center mt-4">
          <a href="/" className="text-gray-600 text-sm hover:text-brand transition-colors">← Về trang chính</a>
        </p>
      </div>
    </div>
  );
}

// ─── Track Form (Add / Edit) ──────────────────────────────────────────────────

function TrackForm({ initial, onSave, onCancel }) {
  const [form, setForm]         = useState(initial || EMPTY_FORM);
  const [imageFile, setImageFile] = useState(null);
  const [audioFile, setAudioFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(initial?.imageUrl || '');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving]     = useState(false);
  const imageRef = useRef(); const audioRef = useRef();

  const isEdit = !!initial?._id;

  function setField(key, val) { setForm(f => ({ ...f, [key]: val })); }

  function handleImageFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  async function uploadFiles() {
    let imageUrl = form.imageUrl;
    let audioUrl = form.audioUrl;
    setUploading(true);
    try {
      if (imageFile) {
        const fd = new FormData(); fd.append('image', imageFile);
        const res  = await fetch(`${API}/upload/image`, { method: 'POST', body: fd });
        const data = await res.json();
        if (data.success) imageUrl = `http://localhost:5000${data.url}`;
        else throw new Error('Upload ảnh thất bại');
      }
      if (audioFile && form.audioType === 'file') {
        const fd = new FormData(); fd.append('audio', audioFile);
        const res  = await fetch(`${API}/upload/audio`, { method: 'POST', body: fd });
        const data = await res.json();
        if (data.success) audioUrl = `http://localhost:5000${data.url}`;
        else throw new Error('Upload audio thất bại');
      }
    } finally { setUploading(false); }
    return { imageUrl, audioUrl };
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const { imageUrl, audioUrl } = await uploadFiles();
      const payload = {
        ...form,
        imageUrl,
        audioUrl,
        tags: typeof form.tags === 'string' ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : form.tags,
        bpm: Number(form.bpm),
        price: Number(form.price),
      };
      const url    = isEdit ? `${API}/tracks/${initial._id}` : `${API}/tracks`;
      const method = isEdit ? 'PUT' : 'POST';
      const res    = await fetch(url, {
        method, headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        toast(isEdit ? 'Đã cập nhật beat!' : 'Đã thêm beat mới!');
        onSave(data.data);
      } else throw new Error(data.message);
    } catch (err) {
      toast(err.message, 'error');
    }
    setSaving(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto py-8 px-4" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}>
      <div className="w-full max-w-2xl rounded-2xl" style={{ background: '#15121c', border: '1px solid rgba(201,169,110,0.2)' }}>
        {/* Header */}
        <div className="flex items-center justify-between p-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <h2 className="font-bold text-gray-100 text-lg">{isEdit ? '✏️ Sửa Beat' : '➕ Thêm Beat Mới'}</h2>
          <button onClick={onCancel} className="p-2 rounded-lg text-gray-600 hover:text-white hover:bg-white/5 transition-all"><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {/* Row 1: title + producer */}
          <div className="grid sm:grid-cols-2 gap-4">
            <Field id="f-title" label="Tên Beat *">
              <input id="f-title" required value={form.title} onChange={e => setField('title', e.target.value)} placeholder="VD: Đêm Mưa Sài Gòn" className="input-field" />
            </Field>
            <Field id="f-producer" label="Producer">
              <input id="f-producer" value={form.producer} onChange={e => setField('producer', e.target.value)} className="input-field" />
            </Field>
          </div>

          {/* Row 2: genre, bpm, key, duration */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Field id="f-genre" label="Genre">
              <select id="f-genre" value={form.genre} onChange={e => setField('genre', e.target.value)} className="input-field">
                {GENRES.map(g => <option key={g}>{g}</option>)}
              </select>
            </Field>
            <Field id="f-bpm" label="BPM">
              <input id="f-bpm" type="number" min="40" max="250" value={form.bpm} onChange={e => setField('bpm', e.target.value)} className="input-field" />
            </Field>
            <Field id="f-key" label="Key">
              <select id="f-key" value={form.key} onChange={e => setField('key', e.target.value)} className="input-field">
                {KEY_LIST.map(k => <option key={k}>{k}</option>)}
              </select>
            </Field>
            <Field id="f-duration" label="Thời lượng">
              <input id="f-duration" value={form.duration} onChange={e => setField('duration', e.target.value)} placeholder="3:24" className="input-field" />
            </Field>
          </div>

          {/* Row 3: price + plays + featured */}
          <div className="grid sm:grid-cols-3 gap-4">
            <Field id="f-price" label="Giá ($) *">
              <input id="f-price" type="number" min="0" step="0.01" required value={form.price} onChange={e => setField('price', e.target.value)} className="input-field" />
            </Field>
            <Field id="f-plays" label="Lượt nghe">
              <input id="f-plays" value={form.plays} onChange={e => setField('plays', e.target.value)} placeholder="128K" className="input-field" />
            </Field>
            <Field id="f-featured" label="Nổi bật">
              <div className="flex items-center gap-2 h-[42px]">
                <button type="button" id="f-featured-toggle"
                  onClick={() => setField('featured', !form.featured)}
                  className="w-12 h-6 rounded-full relative transition-all"
                  style={{ background: form.featured ? '#c9a96e' : '#2e2940' }}>
                  <span className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all"
                    style={{ left: form.featured ? '26px' : '2px', boxShadow: '0 1px 4px rgba(0,0,0,0.3)' }} />
                </button>
                <span className="text-sm text-gray-400">{form.featured ? 'Có' : 'Không'}</span>
              </div>
            </Field>
          </div>

          {/* Tags */}
          <Field id="f-tags" label="Tags (phân cách bằng dấu phẩy)">
            <input id="f-tags" value={typeof form.tags === 'string' ? form.tags : form.tags?.join(', ')} onChange={e => setField('tags', e.target.value)} placeholder="R&B, Chill, Melodic" className="input-field" />
          </Field>

          {/* Color */}
          <div>
            <label className="block text-xs text-gray-600 uppercase tracking-wider mb-2">Màu Accent</label>
            <div className="flex items-center gap-2 flex-wrap">
              {COLORS.map(c => (
                <button key={c} type="button"
                  onClick={() => setField('color', c)}
                  className="w-8 h-8 rounded-full transition-all hover:scale-110"
                  style={{ background: c, boxShadow: form.color === c ? `0 0 0 3px white, 0 0 0 5px ${c}` : 'none' }} />
              ))}
              <input type="color" value={form.color} onChange={e => setField('color', e.target.value)}
                className="w-8 h-8 rounded-full cursor-pointer border-0 bg-transparent" title="Màu tùy chỉnh" />
            </div>
          </div>

          {/* Image upload */}
          <div>
            <label className="block text-xs text-gray-600 uppercase tracking-wider mb-2">Ảnh Artwork</label>
            <div className="flex gap-3 items-start">
              {/* Preview */}
              <div className="w-20 h-20 rounded-xl flex-shrink-0 flex items-center justify-center overflow-hidden"
                style={{ background: imagePreview ? 'transparent' : `${form.color}22`, border: `1px solid ${form.color}33` }}>
                {imagePreview
                  ? <img src={imagePreview} alt="preview" className="w-full h-full object-cover" onError={() => setImagePreview('')} />
                  : <Image size={24} style={{ color: form.color }} />
                }
              </div>
              <div className="flex-1 space-y-2">
                <button type="button" id="upload-image-btn"
                  onClick={() => imageRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium w-full justify-center transition-all"
                  style={{ background: 'rgba(201,169,110,0.08)', border: '1px dashed rgba(201,169,110,0.3)', color: '#c9a96e' }}>
                  <Upload size={14} /> {imageFile ? imageFile.name : 'Chọn ảnh (JPG/PNG)'}
                </button>
                <input ref={imageRef} type="file" accept="image/*" className="hidden" onChange={handleImageFile} />
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
                  <span className="text-xs text-gray-600">hoặc nhập link</span>
                  <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
                </div>
                <input value={form.imageUrl} onChange={e => { setField('imageUrl', e.target.value); setImagePreview(e.target.value); }}
                  placeholder="https://..." className="input-field text-xs" />
              </div>
            </div>
          </div>

          {/* Audio */}
          <div>
            <label className="block text-xs text-gray-600 uppercase tracking-wider mb-2">Audio Preview</label>
            {/* Toggle */}
            <div className="flex gap-2 mb-3">
              {[['url', <Link2 size={13} />, 'Nhập Link'], ['file', <Upload size={13} />, 'Upload MP3']].map(([val, icon, lbl]) => (
                <button key={val} type="button" id={`audio-type-${val}`}
                  onClick={() => setField('audioType', val)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all"
                  style={form.audioType === val
                    ? { background: 'rgba(201,169,110,0.15)', color: '#c9a96e', border: '1px solid rgba(201,169,110,0.3)' }
                    : { color: '#6b6480', border: '1px solid rgba(255,255,255,0.07)' }}>
                  {icon} {lbl}
                </button>
              ))}
            </div>

            {form.audioType === 'url' ? (
              <input id="audio-url-input" value={form.audioUrl} onChange={e => setField('audioUrl', e.target.value)}
                placeholder="https://soundcloud.com/... hoặc link trực tiếp .mp3"
                className="input-field" />
            ) : (
              <div>
                <button type="button" id="upload-audio-btn"
                  onClick={() => audioRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium w-full justify-center transition-all"
                  style={{ background: 'rgba(201,169,110,0.08)', border: '1px dashed rgba(201,169,110,0.3)', color: '#c9a96e' }}>
                  <Music size={14} /> {audioFile ? audioFile.name : 'Chọn file MP3 / WAV'}
                </button>
                <input ref={audioRef} type="file" accept="audio/*" className="hidden" onChange={e => setAudioFile(e.target.files[0])} />
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <button type="button" onClick={onCancel}
              className="flex-1 py-3 rounded-xl text-sm font-semibold text-gray-500 hover:text-gray-300 hover:bg-white/5 transition-all border border-white/10">
              Hủy
            </button>
            <button id="save-track-btn" type="submit" disabled={saving || uploading}
              className="flex-1 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg, #c9a96e, #e8c98a)', color: '#08070a', opacity: (saving || uploading) ? 0.7 : 1 }}>
              {saving ? <RefreshCw size={15} className="animate-spin" /> : <Save size={15} />}
              {uploading ? 'Đang upload...' : saving ? 'Đang lưu...' : (isEdit ? 'Cập nhật' : 'Thêm Beat')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ id, label, children }) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs text-gray-600 uppercase tracking-wider mb-1.5">{label}</label>
      {children}
    </div>
  );
}

// ─── Track Table Row ──────────────────────────────────────────────────────────

function TrackTableRow({ track, onEdit, onDelete }) {
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!window.confirm(`Xóa "${track.title}"?`)) return;
    setDeleting(true);
    try {
      const res  = await fetch(`${API}/tracks/${track._id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) { toast('Đã xóa!'); onDelete(track._id); }
      else throw new Error(data.message);
    } catch (err) { toast(err.message, 'error'); }
    setDeleting(false);
  }

  return (
    <tr className="border-b transition-colors hover:bg-white/[0.02]" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          {/* Artwork */}
          <div className="w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center font-bold text-white overflow-hidden"
            style={{ background: `linear-gradient(135deg, ${track.color}44, ${track.color}22)`, border: `1px solid ${track.color}33` }}>
            {track.imageUrl
              ? <img src={track.imageUrl} alt="" className="w-full h-full object-cover" onError={e => e.target.style.display='none'} />
              : <span style={{ color: track.color }}>{track.title[0]}</span>
            }
          </div>
          <div>
            <div className="font-semibold text-sm text-gray-200 flex items-center gap-1.5">
              {track.title}
              {track.featured && <Star size={11} className="text-brand fill-current" style={{ color: '#c9a96e' }} />}
            </div>
            <div className="text-xs text-gray-600">{track.producer}</div>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 text-xs text-gray-400">{track.genre}</td>
      <td className="px-4 py-3 text-xs text-gray-500">{track.bpm} · {track.key}</td>
      <td className="px-4 py-3 text-xs text-gray-400">{track.duration}</td>
      <td className="px-4 py-3 text-sm font-bold" style={{ color: '#c9a96e' }}>${Number(track.price).toFixed(2)}</td>
      <td className="px-4 py-3 text-xs text-gray-600">{track.plays}</td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <button id={`edit-${track._id}`} onClick={() => onEdit(track)}
            className="p-1.5 rounded-lg transition-all text-gray-500 hover:text-brand hover:bg-white/5"
            style={{ '--brand': '#c9a96e' }}>
            <Edit2 size={14} />
          </button>
          <button id={`delete-${track._id}`} onClick={handleDelete} disabled={deleting}
            className="p-1.5 rounded-lg transition-all text-gray-500 hover:text-red-400 hover:bg-red-400/5">
            {deleting ? <RefreshCw size={14} className="animate-spin" /> : <Trash2 size={14} />}
          </button>
        </div>
      </td>
    </tr>
  );
}

// ─── Main Admin Component ─────────────────────────────────────────────────────

export default function Admin() {
  const [authed, setAuthed]     = useState(!!sessionStorage.getItem('admin-token'));
  const [tracks, setTracks]     = useState([]);
  const [loading, setLoading]   = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editTrack, setEditTrack] = useState(null);
  const [filter, setFilter]     = useState('All');
  const [search, setSearch]     = useState('');
  const [dbStatus, setDbStatus] = useState('checking');

  useEffect(() => {
    if (authed) { fetchTracks(); checkHealth(); }
  }, [authed]);

  async function checkHealth() {
    try {
      const res = await fetch(`${API}/health`);
      if (res.ok) setDbStatus('connected');
      else setDbStatus('error');
    } catch { setDbStatus('error'); }
  }

  async function fetchTracks() {
    setLoading(true);
    try {
      const res  = await fetch(`${API}/tracks`);
      const data = await res.json();
      if (data.success) setTracks(data.data);
    } catch { toast('Không thể tải danh sách beats', 'error'); }
    setLoading(false);
  }

  function handleLogout() {
    sessionStorage.removeItem('admin-token');
    setAuthed(false);
  }

  function handleSave(saved) {
    setTracks(prev => {
      const idx = prev.findIndex(t => t._id === saved._id);
      if (idx >= 0) { const a = [...prev]; a[idx] = saved; return a; }
      return [saved, ...prev];
    });
    setShowForm(false); setEditTrack(null);
  }

  function handleDelete(id) { setTracks(prev => prev.filter(t => t._id !== id)); }

  function openAdd()        { setEditTrack(null); setShowForm(true); }
  function openEdit(track)  { setEditTrack(track); setShowForm(true); }
  function closeForm()      { setShowForm(false); setEditTrack(null); }

  const displayed = tracks.filter(t => {
    const matchGenre  = filter === 'All' || t.genre === filter;
    const matchSearch = !search || t.title.toLowerCase().includes(search.toLowerCase()) || t.producer.toLowerCase().includes(search.toLowerCase());
    return matchGenre && matchSearch;
  });

  if (!authed) return <LoginScreen onLogin={() => setAuthed(true)} />;

  return (
    <div className="min-h-screen" style={{ background: '#08070a', color: '#e8e0d5' }}>
      {/* Topbar */}
      <header className="glass sticky top-0 z-40 h-14" style={{ borderBottom: '1px solid rgba(201,169,110,0.1)' }}>
        <div className="max-w-7xl mx-auto h-full px-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center font-black text-xs"
              style={{ background: 'linear-gradient(135deg, #c9a96e, #e8c98a)', color: '#08070a' }}>BAT</div>
            <span className="font-bold text-gray-200">Admin Panel</span>
            {/* DB status */}
            <span className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full"
              style={dbStatus === 'connected'
                ? { background: 'rgba(122,184,160,0.12)', color: '#7ab8a0', border: '1px solid rgba(122,184,160,0.2)' }
                : { background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: dbStatus === 'connected' ? '#7ab8a0' : '#ef4444' }} />
              {dbStatus === 'connected' ? 'MongoDB Connected' : dbStatus === 'checking' ? 'Đang kiểm tra...' : 'Mất kết nối'}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <a href="/" target="_blank"
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
        {/* Stats cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Tổng Beats', value: tracks.length, color: '#c9a96e' },
            { label: 'Nổi Bật',   value: tracks.filter(t => t.featured).length, color: '#e8c98a' },
            { label: 'R&B',       value: tracks.filter(t => t.genre === 'R&B').length, color: '#d4756b' },
            { label: 'Lo-Fi',     value: tracks.filter(t => t.genre === 'Lo-Fi').length, color: '#7ab8a0' },
          ].map(({ label, value, color }) => (
            <div key={label} className="p-4 rounded-2xl"
              style={{ background: 'rgba(21,18,28,0.6)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div className="text-3xl font-black" style={{ color }}>{value}</div>
              <div className="text-xs text-gray-600 mt-1">{label}</div>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          {/* Search */}
          <input id="admin-search" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Tìm kiếm beat..."
            className="flex-1 px-4 py-2.5 rounded-xl text-sm text-gray-300 placeholder-gray-700 outline-none"
            style={{ background: 'rgba(21,18,28,0.7)', border: '1px solid rgba(255,255,255,0.07)' }}
            onFocus={e => e.target.style.borderColor = 'rgba(201,169,110,0.35)'}
            onBlur={e  => e.target.style.borderColor = 'rgba(255,255,255,0.07)'} />

          {/* Genre filter */}
          <div className="flex gap-2">
            {['All', ...GENRES.slice(0,3)].map(g => (
              <button key={g} id={`admin-filter-${g.toLowerCase()}`}
                onClick={() => setFilter(g)}
                className="px-3 py-2 rounded-xl text-xs font-medium transition-all"
                style={filter === g
                  ? { background: 'rgba(201,169,110,0.15)', color: '#c9a96e', border: '1px solid rgba(201,169,110,0.3)' }
                  : { color: '#6b6480', border: '1px solid rgba(255,255,255,0.07)' }}>
                {g}
              </button>
            ))}
          </div>

          {/* Refresh */}
          <button id="refresh-btn" onClick={fetchTracks} disabled={loading}
            className="p-2.5 rounded-xl text-gray-500 hover:text-gray-300 transition-all hover:bg-white/5 border border-white/10">
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>

          {/* Add beat */}
          <button id="add-track-btn" onClick={openAdd}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all"
            style={{ background: 'linear-gradient(135deg, #c9a96e, #e8c98a)', color: '#08070a', boxShadow: '0 0 20px rgba(201,169,110,0.3)' }}>
            <Plus size={16} /> Thêm Beat
          </button>
        </div>

        {/* Table */}
        <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(21,18,28,0.5)', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="flex items-center gap-2 px-5 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <LayoutList size={14} className="text-gray-600" />
            <span className="text-sm font-semibold text-gray-400">{displayed.length} beats</span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20 gap-3 text-gray-600">
              <RefreshCw size={20} className="animate-spin" /> Đang tải...
            </div>
          ) : displayed.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-700">
              <Music size={48} className="opacity-20" />
              <p className="text-sm">Chưa có beat nào. Bấm "Thêm Beat" để bắt đầu!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    {['Beat', 'Genre', 'BPM · Key', 'Thời lượng', 'Giá', 'Lượt nghe', 'Thao tác'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {displayed.map(track => (
                    <TrackTableRow key={track._id} track={track} onEdit={openEdit} onDelete={handleDelete} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Help */}
        <p className="text-center text-xs text-gray-700 mt-6">
          Admin Panel — BAT Music · Mọi thay đổi được lưu vào MongoDB Atlas ngay lập tức
        </p>
      </main>

      {/* Form modal */}
      {showForm && (
        <TrackForm
          initial={editTrack ? {
            ...editTrack,
            tags: Array.isArray(editTrack.tags) ? editTrack.tags.join(', ') : editTrack.tags,
          } : null}
          onSave={handleSave}
          onCancel={closeForm}
        />
      )}
    </div>
  );
}
