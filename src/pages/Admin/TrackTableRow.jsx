// pages/Admin/TrackTableRow.jsx
// 1 dòng trong bảng quản lý beats
import { useState } from 'react';
import { Edit2, Trash2, RefreshCw, Star } from 'lucide-react';

import { API } from '@/constants/api';

function toast(msg, type = 'success') {
  const el = document.createElement('div');
  el.textContent = msg;
  el.style.cssText = `
    position:fixed;bottom:24px;right:24px;z-index:9999;
    padding:12px 20px;border-radius:12px;font-size:14px;font-weight:600;
    box-shadow:0 8px 24px rgba(0,0,0,0.4);animation:fadeUp .3s ease;
    background:${type === 'success' ? 'linear-gradient(135deg,#c9a96e,#e8c98a)' : '#ef4444'};
    color:${type === 'success' ? '#08070a' : 'white'};
  `;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 3000);
}

export default function TrackTableRow({ track, onEdit, onDelete }) {
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!window.confirm(`Xóa "${track.title}"?`)) return;
    setDeleting(true);
    try {
      const token = sessionStorage.getItem('admin-token');
      const res  = await fetch(`${API}/tracks/${track._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) { toast('Đã xóa!'); onDelete(track._id); }
      else throw new Error(data.message);
    } catch (err) {
      toast(err.message, 'error');
    }
    setDeleting(false);
  }

  return (
    <tr
      className="border-b transition-colors hover:bg-white/[0.02]"
      style={{ borderColor: 'rgba(255,255,255,0.04)' }}>

      {/* Artwork + Title */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center font-bold text-white overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${track.color}44, ${track.color}22)`,
              border:     `1px solid ${track.color}33`,
            }}>
            {track.imageUrl
              ? <img src={track.imageUrl} alt="" className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
              : <span style={{ color: track.color }}>{track.title?.[0]}</span>
            }
          </div>
          <div>
            <div className="font-semibold text-sm text-gray-200 flex items-center gap-1.5">
              {track.title}
              {track.featured && <Star size={11} style={{ color: '#c9a96e' }} className="fill-current" />}
            </div>
            <div className="text-xs text-gray-600">{track.producer ?? 'BAT'}</div>
          </div>
        </div>
      </td>

      <td className="px-4 py-3 text-xs text-gray-400">{track.genre}</td>
      <td className="px-4 py-3 text-xs text-gray-500">{track.bpm} · {track.key}</td>
      <td className="px-4 py-3 text-xs text-gray-400">{track.duration}</td>
      <td className="px-4 py-3 text-sm font-bold" style={{ color: '#c9a96e' }}>
        ${Number(track.price).toFixed(2)}
      </td>
      <td className="px-4 py-3 text-xs text-gray-600">{track.plays}</td>

      {/* Actions */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <button
            id={`edit-${track._id}`}
            onClick={() => onEdit(track)}
            className="p-1.5 rounded-lg transition-all text-gray-500 hover:text-brand hover:bg-white/5">
            <Edit2 size={14} />
          </button>
          <button
            id={`delete-${track._id}`}
            onClick={handleDelete}
            disabled={deleting}
            className="p-1.5 rounded-lg transition-all text-gray-500 hover:text-red-400 hover:bg-red-400/5">
            {deleting ? <RefreshCw size={14} className="animate-spin" /> : <Trash2 size={14} />}
          </button>
        </div>
      </td>
    </tr>
  );
}
