// components/tracks/TrackRow.jsx
// Hiển thị 1 dòng beat trong danh sách — có nút tải về khi đã mở khoá
import { useState } from 'react';
import { Play, Pause, Heart, Check, Lock, Unlock, Headphones, Flame, Download } from 'lucide-react';
import ArtworkPlaceholder from '@/components/ui/ArtworkPlaceholder';
import Equalizer          from '@/components/ui/Equalizer';

export default function TrackRow({
  track,
  index,
  isActive,
  isPlaying,
  isUnlocked,
  onPlay,
  onAddToCart,
  onShowPaywall,
}) {
  const [liked, setLiked] = useState(track.liked ?? false);
  const [added, setAdded] = useState(false);

  function handleCart(e) {
    e.stopPropagation();
    if (added) return;
    setAdded(true);
    onAddToCart(track);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <div
      id={`track-${track.id ?? track._id}`}
      className={`track-row ${isActive ? 'active-track' : ''}`}
      onClick={() => onPlay(track)}>

      {/* Số thứ tự / EQ */}
      <div className="w-6 text-center flex-shrink-0">
        {isActive
          ? <Equalizer />
          : <span className="text-gray-600 text-sm font-mono">{String(index + 1).padStart(2, '0')}</span>
        }
      </div>

      {/* Nút Play/Pause */}
      <button
        id={`play-${track.id ?? track._id}`}
        onClick={(e) => { e.stopPropagation(); onPlay(track); }}
        className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200 hover:scale-110"
        style={{
          background: isActive
            ? `linear-gradient(135deg, ${track.color}, ${track.color}99)`
            : 'rgba(201,169,110,0.08)',
          border:     isActive ? `1px solid ${track.color}55` : '1px solid rgba(201,169,110,0.15)',
          boxShadow:  isActive ? `0 0 16px ${track.color}44` : 'none',
        }}>
        {isActive && isPlaying
          ? <Pause size={15} className="text-white" />
          : <Play  size={15} className="text-white fill-current ml-0.5" />
        }
      </button>

      {/* Artwork */}
      <ArtworkPlaceholder
        color={track.color}
        size="md"
        title={track.title}
        imageUrl={track.imageUrl}
      />

      {/* Tên + trạng thái khoá */}
      <div className="flex-1 min-w-0">
        <div className={`font-semibold text-sm truncate flex items-center gap-1.5 ${isActive ? 'text-brand' : 'text-gray-200'}`}>
          {track.title}
          {track.hot && <Flame size={12} style={{ color: '#f59e0b', flexShrink: 0 }} />}
        </div>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          <span className="text-xs text-gray-600">{track.producer ?? 'BAT'}</span>
          <span className="text-gray-700 text-xs">·</span>
          {isUnlocked ? (
            <span className="flex items-center gap-0.5 text-xs" style={{ color: '#7ab8a0' }}>
              <Unlock size={10} /> Full track
            </span>
          ) : (
            <span className="flex items-center gap-0.5 text-xs" style={{ color: '#c9a96e' }}>
              <Lock size={10} /> 30s thử
            </span>
          )}
          {track.tags?.slice(0, 1).map((t) => (
            <span key={t} className="genre-tag">{t}</span>
          ))}
        </div>
      </div>

      {/* BPM · Key · Thời lượng */}
      <div className="hidden md:flex items-center gap-5 flex-shrink-0 text-xs text-gray-600">
        <div className="text-center">
          <div className="text-gray-300 font-semibold">{track.bpm}</div>
          <div>BPM</div>
        </div>
        <div className="text-center">
          <div className="text-gray-300 font-semibold">{track.key}</div>
          <div>Key</div>
        </div>
        <div className="text-center">
          <div className="text-gray-300 font-semibold">{track.duration}</div>
          <div>Thời lượng</div>
        </div>
      </div>

      {/* Lượt nghe */}
      <div className="hidden lg:flex items-center gap-1.5 text-xs text-gray-600 flex-shrink-0">
        <Headphones size={12} /> {track.plays}
      </div>

      {/* Like */}
      <button
        id={`like-${track.id ?? track._id}`}
        onClick={(e) => { e.stopPropagation(); setLiked((l) => !l); }}
        className="p-2 flex-shrink-0 transition-all hidden sm:block">
        <Heart
          size={16}
          fill={liked ? '#d4756b' : 'none'}
          className={liked ? 'text-accent' : 'text-gray-700 hover:text-accent transition-colors'}
        />
      </button>

      {/* Nút mở khoá hoặc tải về + giỏ hàng */}
      {isUnlocked ? (
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {/* Download */}
          {track.audioUrl && (
            <a
              href={track.audioUrl}
              download={`${track.title || 'beat'}.mp3`}
              onClick={(e) => e.stopPropagation()}
              className="p-2.5 rounded-xl transition-all flex items-center justify-center hover:scale-110"
              style={{ background: 'rgba(122,184,160,0.12)', color: '#7ab8a0', border: '1px solid rgba(122,184,160,0.25)' }}
              title="Tải về">
              <Download size={14} />
            </a>
          )}
          {/* Cart */}
          <button
            id={`cart-${track.id ?? track._id}`}
            onClick={handleCart}
            className="px-3.5 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-1.5 justify-center"
            style={added
              ? { background: 'rgba(122,184,160,0.15)', color: '#7ab8a0', border: '1px solid rgba(122,184,160,0.3)' }
              : { background: 'rgba(201,169,110,0.1)',  color: '#c9a96e', border: '1px solid rgba(201,169,110,0.25)' }
            }>
            {added ? <><Check size={14} /> Đã thêm</> : <>{'$'}{track.price}</>}
          </button>
        </div>
      ) : (
        <button
          id={`unlock-${track.id ?? track._id}`}
          onClick={(e) => { e.stopPropagation(); onShowPaywall(track); }}
          className="flex-shrink-0 px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 min-w-[90px] justify-center"
          style={{ background: 'rgba(201,169,110,0.08)', color: '#c9a96e', border: '1px dashed rgba(201,169,110,0.3)' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(201,169,110,0.18)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(201,169,110,0.08)'; }}>
          <Lock size={12} /> 5.000đ
        </button>
      )}
    </div>
  );
}
