// pages/Admin/TrackForm.jsx
// Form thêm mới hoặc chỉnh sửa 1 beat
import { useState, useRef } from 'react';
import { X, Save, Upload, Music, Link2, RefreshCw, Image } from 'lucide-react';

import { API, getMediaUrl } from '@/constants/api';

const GENRES   = ['R&B', 'Lo-Fi', 'Hip-Hop', 'Pop', 'Trap', 'Other'];
const KEY_LIST = ['Am','Cm','Dm','Em','Fm','Gm','Amaj','Cmaj','Dmaj','Emaj','Fmaj','Gmaj','Bbmaj','Ebm','F#m','C#m','Bb'];
const COLORS   = ['#c9a96e','#d4756b','#7ab8a0','#a78bca','#74b8d4','#e8a09a','#d4a574','#b07aa0'];

const EMPTY_FORM = {
  title: '', producer: 'BAT', genre: 'R&B', bpm: 90,
  key: 'Am', duration: '3:00', price: 29.99,
  tags: '', imageUrl: '', audioUrl: '', audioType: 'url',
  color: '#c9a96e', featured: false, plays: '0',
};

function Field({ id, label, children }) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs text-gray-600 uppercase tracking-wider mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );
}

function toast(msg, type = 'success') {
  const el = document.createElement('div');
  el.textContent = msg;
  el.style.cssText = `
    position:fixed;bottom:24px;right:24px;z-index:9999;
    padding:12px 20px;border-radius:12px;font-size:14px;font-weight:600;
    box-shadow:0 8px 24px rgba(0,0,0,0.4);
    background:${type === 'success' ? 'linear-gradient(135deg,#c9a96e,#e8c98a)' : '#ef4444'};
    color:${type === 'success' ? '#08070a' : 'white'};
  `;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 3000);
}

export default function TrackForm({ initial, onSave, onCancel }) {
  const isEdit = !!initial?._id;

  const [form,         setForm]         = useState(initial
    ? { ...initial, tags: Array.isArray(initial.tags) ? initial.tags.join(', ') : (initial.tags ?? '') }
    : EMPTY_FORM
  );
  const [imageFile,    setImageFile]    = useState(null);
  const [audioFile,    setAudioFile]    = useState(null);
  const [imagePreview, setImagePreview] = useState(initial?.imageUrl ?? '');
  const [uploading,    setUploading]    = useState(false);
  const [saving,       setSaving]       = useState(false);

  const imageRef = useRef();
  const audioRef = useRef();

  function setField(key, val) { setForm((f) => ({ ...f, [key]: val })); }

  function handleImageFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  async function uploadFiles() {
    let { imageUrl, audioUrl } = form;
    setUploading(true);
    try {
      const token = sessionStorage.getItem('admin-token');
      if (imageFile) {
        const fd = new FormData(); fd.append('image', imageFile);
        const res  = await fetch(`${API}/upload/image`, {
          method: 'POST',
          body: fd,
          headers: { 'Authorization': `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) imageUrl = getMediaUrl(data.url);
        else throw new Error('Upload ảnh thất bại');
      }
      if (audioFile && form.audioType === 'file') {
        const fd = new FormData(); fd.append('audio', audioFile);
        const res  = await fetch(`${API}/upload/audio`, {
          method: 'POST',
          body: fd,
          headers: { 'Authorization': `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) audioUrl = getMediaUrl(data.url);
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
        tags:  typeof form.tags === 'string'
          ? form.tags.split(',').map((t) => t.trim()).filter(Boolean)
          : form.tags,
        bpm:   Number(form.bpm),
        price: Number(form.price),
      };
      const url    = isEdit ? `${API}/tracks/${initial._id}` : `${API}/tracks`;
      const method = isEdit ? 'PUT' : 'POST';
      const token  = sessionStorage.getItem('admin-token');
      const res    = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
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
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto py-8 px-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}>
      <div
        className="w-full max-w-2xl rounded-2xl"
        style={{ background: '#15121c', border: '1px solid rgba(201,169,110,0.2)' }}>

        {/* Header */}
        <div
          className="flex items-center justify-between p-5"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <h2 className="font-bold text-gray-100 text-lg">
            {isEdit ? '✏️ Sửa Beat' : '➕ Thêm Beat Mới'}
          </h2>
          <button
            onClick={onCancel}
            className="p-2 rounded-lg text-gray-600 hover:text-white hover:bg-white/5 transition-all">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5">

          {/* Title + Producer */}
          <div className="grid sm:grid-cols-2 gap-4">
            <Field id="f-title" label="Tên Beat *">
              <input id="f-title" required value={form.title}
                onChange={(e) => setField('title', e.target.value)}
                placeholder="VD: Đêm Mưa Sài Gòn" className="input-field" />
            </Field>
            <Field id="f-producer" label="Producer">
              <input id="f-producer" value={form.producer}
                onChange={(e) => setField('producer', e.target.value)} className="input-field" />
            </Field>
          </div>

          {/* Genre + BPM + Key + Duration */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Field id="f-genre" label="Genre">
              <select id="f-genre" value={form.genre}
                onChange={(e) => setField('genre', e.target.value)} className="input-field">
                {GENRES.map((g) => <option key={g}>{g}</option>)}
              </select>
            </Field>
            <Field id="f-bpm" label="BPM">
              <input id="f-bpm" type="number" min="40" max="250" value={form.bpm}
                onChange={(e) => setField('bpm', e.target.value)} className="input-field" />
            </Field>
            <Field id="f-key" label="Key">
              <select id="f-key" value={form.key}
                onChange={(e) => setField('key', e.target.value)} className="input-field">
                {KEY_LIST.map((k) => <option key={k}>{k}</option>)}
              </select>
            </Field>
            <Field id="f-duration" label="Thời lượng">
              <input id="f-duration" value={form.duration}
                onChange={(e) => setField('duration', e.target.value)}
                placeholder="3:24" className="input-field" />
            </Field>
          </div>

          {/* Price + Plays + Featured */}
          <div className="grid sm:grid-cols-3 gap-4">
            <Field id="f-price" label="Giá ($) *">
              <input id="f-price" type="number" min="0" step="0.01" required value={form.price}
                onChange={(e) => setField('price', e.target.value)} className="input-field" />
            </Field>
            <Field id="f-plays" label="Lượt nghe">
              <input id="f-plays" value={form.plays}
                onChange={(e) => setField('plays', e.target.value)}
                placeholder="128K" className="input-field" />
            </Field>
            <Field id="f-featured" label="Nổi bật">
              <div className="flex items-center gap-2" style={{ height: 42 }}>
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
            <input id="f-tags" value={form.tags}
              onChange={(e) => setField('tags', e.target.value)}
              placeholder="R&B, Chill, Melodic" className="input-field" />
          </Field>

          {/* Color */}
          <div>
            <label className="block text-xs text-gray-600 uppercase tracking-wider mb-2">Màu Accent</label>
            <div className="flex items-center gap-2 flex-wrap">
              {COLORS.map((c) => (
                <button key={c} type="button"
                  onClick={() => setField('color', c)}
                  className="w-8 h-8 rounded-full transition-all hover:scale-110"
                  style={{ background: c, boxShadow: form.color === c ? `0 0 0 3px white, 0 0 0 5px ${c}` : 'none' }} />
              ))}
              <input type="color" value={form.color}
                onChange={(e) => setField('color', e.target.value)}
                className="w-8 h-8 rounded-full cursor-pointer border-0 bg-transparent" />
            </div>
          </div>

          {/* Image */}
          <div>
            <label className="block text-xs text-gray-600 uppercase tracking-wider mb-2">Ảnh Artwork</label>
            <div className="flex gap-3 items-start">
              <div
                className="w-20 h-20 rounded-xl flex-shrink-0 flex items-center justify-center overflow-hidden"
                style={{ background: imagePreview ? 'transparent' : `${form.color}22`, border: `1px solid ${form.color}33` }}>
                {imagePreview
                  ? <img src={imagePreview} alt="preview" className="w-full h-full object-cover" onError={() => setImagePreview('')} />
                  : <Image size={24} style={{ color: form.color }} />
                }
              </div>
              <div className="flex-1 space-y-2">
                <button type="button" id="upload-image-btn"
                  onClick={() => imageRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium w-full justify-center"
                  style={{ background: 'rgba(201,169,110,0.08)', border: '1px dashed rgba(201,169,110,0.3)', color: '#c9a96e' }}>
                  <Upload size={14} /> {imageFile ? imageFile.name : 'Chọn ảnh (JPG/PNG)'}
                </button>
                <input ref={imageRef} type="file" accept="image/*" className="hidden" onChange={handleImageFile} />
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
                  <span className="text-xs text-gray-600">hoặc nhập link</span>
                  <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
                </div>
                <input value={form.imageUrl}
                  onChange={(e) => { setField('imageUrl', e.target.value); setImagePreview(e.target.value); }}
                  placeholder="https://..." className="input-field text-xs" />
              </div>
            </div>
          </div>

          {/* Audio */}
          <div>
            <label className="block text-xs text-gray-600 uppercase tracking-wider mb-2">Audio Preview</label>
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
              <input id="audio-url-input" value={form.audioUrl}
                onChange={(e) => setField('audioUrl', e.target.value)}
                placeholder="https://soundcloud.com/... hoặc link .mp3" className="input-field" />
            ) : (
              <div>
                <button type="button" id="upload-audio-btn"
                  onClick={() => audioRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium w-full justify-center"
                  style={{ background: 'rgba(201,169,110,0.08)', border: '1px dashed rgba(201,169,110,0.3)', color: '#c9a96e' }}>
                  <Music size={14} /> {audioFile ? audioFile.name : 'Chọn file MP3 / WAV'}
                </button>
                <input ref={audioRef} type="file" accept="audio/*" className="hidden"
                  onChange={(e) => setAudioFile(e.target.files[0])} />
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <button type="button" onClick={onCancel}
              className="flex-1 py-3 rounded-xl text-sm font-semibold text-gray-500 hover:text-gray-300 hover:bg-white/5 transition-all border border-white/10">
              Hủy
            </button>
            <button id="save-track-btn" type="submit" disabled={saving || uploading}
              className="flex-1 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg, #c9a96e, #e8c98a)', color: '#08070a', opacity: (saving || uploading) ? 0.7 : 1 }}>
              {saving
                ? <><RefreshCw size={15} className="animate-spin" /> Đang lưu...</>
                : uploading
                  ? <><RefreshCw size={15} className="animate-spin" /> Đang upload...</>
                  : <><Save size={15} /> {isEdit ? 'Cập nhật' : 'Thêm Beat'}</>
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
