// components/player/AudioPlayer.jsx
// Thanh nhạc cố định dưới màn hình — có tua nhạc kéo thả + âm lượng
import { useState, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Heart, Lock, Unlock } from 'lucide-react';
import ArtworkPlaceholder from '@/components/ui/ArtworkPlaceholder';
import { PREVIEW_SECONDS } from '@/constants/payment';

/** Chuyển giây → mm:ss */
function fmt(sec) {
  if (!sec || isNaN(sec)) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function AudioPlayer({
  track,
  isPlaying,
  elapsed = 0,
  duration = 0,
  isUnlocked = false,
  onToggle,
  onPrev,
  onNext,
  onShowPaywall,
  onSeek,
  onVolumeChange,
}) {
  const [volume,   setVolume]   = useState(70);
  const [muted,    setMuted]    = useState(false);
  const [liked,    setLiked]    = useState(false);
  const [dragging, setDragging] = useState(false);
  const [hoverPct, setHoverPct] = useState(null); // % khi hover
  const barRef = useRef(null);

  if (!track) return null;

  // ── Tính toán progress ────────────────────────────────────────────────────
  const previewLimit = PREVIEW_SECONDS;
  const totalTrackSec = duration || track.durationSec || 200;
  const totalSec     = isUnlocked ? totalTrackSec : previewLimit;
  const progressPct  = Math.min((elapsed / totalSec) * 100, 100);
  const lockedPct    = (previewLimit / totalTrackSec) * 100;

  // ── Tính vị trí tua từ click/drag trên thanh ──────────────────────────────
  function getPctFromEvent(e) {
    const bar = barRef.current;
    if (!bar) return 0;
    const rect = bar.getBoundingClientRect();
    const x = (e.clientX ?? e.touches?.[0]?.clientX ?? 0) - rect.left;
    return Math.max(0, Math.min(1, x / rect.width));
  }

  function handleBarClick(e) {
    const pct = getPctFromEvent(e);
    if (!isUnlocked) {
      // Chỉ cho tua trong 30s preview
      const maxPct = lockedPct / 100;
      onSeek(pct * totalTrackSec * (pct > maxPct ? maxPct : 1));
    } else {
      onSeek(pct * totalTrackSec);
    }
  }

  function handleMouseDown(e) {
    setDragging(true);
    handleBarClick(e);
  }

  function handleMouseMove(e) {
    if (!dragging) {
      const pct = getPctFromEvent(e);
      setHoverPct(pct * 100);
      return;
    }
    const pct = getPctFromEvent(e);
    if (!isUnlocked) {
      const capped = Math.min(pct, lockedPct / 100);
      onSeek(capped * totalTrackSec);
    } else {
      onSeek(pct * totalTrackSec);
    }
  }

  function handleMouseUp() {
    setDragging(false);
  }

  return (
    <div
      id="audio-player"
      className="glass fixed bottom-0 left-0 right-0 z-50"
      style={{ borderTop: '1px solid rgba(201,169,110,0.12)', height: 72 }}>

      {/* ── Progress Bar (kéo thả) ────────────────────────────────────────── */}
      <div
        ref={barRef}
        className="absolute top-0 left-0 right-0 group cursor-pointer select-none"
        style={{ height: 20, marginTop: -10 }}
        onClick={handleBarClick}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => { setDragging(false); setHoverPct(null); }}>

        {/* Track nền */}
        <div
          className="absolute bottom-0 left-0 right-0 rounded-full transition-all duration-150"
          style={{ height: dragging ? 6 : 3, background: '#1c1826' }}>

          {/* Phần đã phát */}
          <div
            className="absolute top-0 left-0 h-full rounded-full"
            style={{
              width:      `${progressPct}%`,
              background: 'linear-gradient(90deg, #c9a96e, #e8c98a)',
              transition: dragging ? 'none' : 'width 0.3s linear',
            }}
          />

          {/* Vùng bị khoá (xám) */}
          {!isUnlocked && (
            <div
              className="absolute top-0 h-full rounded-r-full opacity-20"
              style={{ left: `${lockedPct}%`, right: 0, background: '#6b6480' }}
            />
          )}

          {/* Marker khoá */}
          {!isUnlocked && (
            <div
              className="absolute top-1/2 -translate-y-1/2 w-0.5 h-4"
              style={{ left: `${lockedPct}%`, background: 'rgba(201,169,110,0.6)' }}
            />
          )}

          {/* Thumb (nút kéo) */}
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full shadow-lg transition-all duration-150"
            style={{
              left:       `${progressPct}%`,
              background: 'linear-gradient(135deg, #c9a96e, #e8c98a)',
              opacity:    dragging || hoverPct !== null ? 1 : 0,
              transform:  `translateX(-50%) translateY(-50%) scale(${dragging ? 1.3 : 1})`,
              boxShadow:  '0 0 8px rgba(201,169,110,0.6)',
            }}
          />

          {/* Tooltip thời gian khi hover */}
          {hoverPct !== null && (
            <div
              className="absolute bottom-5 -translate-x-1/2 px-2 py-0.5 rounded text-xs font-bold pointer-events-none"
              style={{
                left:       `${hoverPct}%`,
                background: 'rgba(21,18,28,0.95)',
                color:      '#c9a96e',
                border:     '1px solid rgba(201,169,110,0.2)',
                whiteSpace: 'nowrap',
              }}>
              {fmt((hoverPct / 100) * totalTrackSec)}
            </div>
          )}
        </div>
      </div>

      {/* ── Player Body ───────────────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto h-full px-4 flex items-center gap-4">

        {/* Now Playing */}
        <div className="flex items-center gap-3 min-w-0 flex-shrink-0" style={{ width: 220 }}>
          <div className="relative flex-shrink-0">
            <ArtworkPlaceholder color={track.color} size="sm" title={track.title} imageUrl={track.imageUrl} />
            {isPlaying && (
              <div className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full animate-pulse" style={{ background: '#c9a96e' }} />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold text-gray-100 truncate">{track.title}</div>
            <div className="text-xs flex items-center gap-1" style={{ color: isUnlocked ? '#7ab8a0' : '#c9a96e' }}>
              {isUnlocked ? <Unlock size={9} /> : <Lock size={9} />}
              <span>{fmt(elapsed)}</span>
              <span className="text-gray-700">/</span>
              <span>{isUnlocked ? fmt(totalTrackSec) : '0:30'}</span>
            </div>
          </div>
          <button onClick={() => setLiked((l) => !l)} className="p-1 flex-shrink-0">
            <Heart size={15} fill={liked ? '#d4756b' : 'none'} className={liked ? 'text-accent' : 'text-gray-700'} />
          </button>
        </div>

        {/* Controls */}
        <div className="flex-1 flex items-center justify-center gap-4">
          <button id="player-prev" onClick={onPrev}
            className="p-2 text-gray-600 hover:text-gray-300 transition-all hover:scale-110">
            <SkipBack size={20} />
          </button>

          <button
            id="player-playpause"
            onClick={onToggle}
            className="w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95"
            style={{ background: 'linear-gradient(135deg, #c9a96e, #e8c98a)', boxShadow: '0 0 20px rgba(201,169,110,0.4)' }}>
            {isPlaying
              ? <Pause size={20} style={{ color: '#08070a' }} />
              : <Play  size={20} style={{ color: '#08070a' }} className="fill-current ml-0.5" />
            }
          </button>

          <button id="player-next" onClick={onNext}
            className="p-2 text-gray-600 hover:text-gray-300 transition-all hover:scale-110">
            <SkipForward size={20} />
          </button>
        </div>

        {/* Volume + Unlock */}
        <div className="hidden md:flex items-center gap-3 flex-shrink-0" style={{ width: 220, justifyContent: 'flex-end' }}>
          <button
            onClick={() => {
              const nextMuted = !muted;
              setMuted(nextMuted);
              onVolumeChange?.(nextMuted ? 0 : volume);
            }}
            className="p-1 text-gray-600 hover:text-gray-300 transition-colors flex-shrink-0">
            {muted ? <VolumeX size={15} /> : <Volume2 size={15} />}
          </button>

          {/* Volume slider */}
          <div className="relative w-20 h-1 rounded-full flex-shrink-0 cursor-pointer" style={{ background: '#2e2940' }}
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const pct  = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
              const volVal = Math.round(pct * 100);
              setVolume(volVal);
              setMuted(false);
              onVolumeChange?.(volVal);
            }}>
            <div className="h-full rounded-full absolute left-0 top-0 pointer-events-none"
              style={{ width: `${muted ? 0 : volume}%`, background: 'linear-gradient(90deg, #c9a96e, #e8c98a)' }} />
            <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full pointer-events-none"
              style={{ left: `${muted ? 0 : volume}%`, background: '#e8c98a', boxShadow: '0 0 4px rgba(201,169,110,0.6)' }} />
          </div>

          <div className="w-px h-4 flex-shrink-0" style={{ background: 'rgba(255,255,255,0.07)' }} />

          {!isUnlocked ? (
            <button
              id="player-unlock-btn"
              onClick={() => onShowPaywall(track)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap"
              style={{ background: 'rgba(201,169,110,0.12)', color: '#c9a96e', border: '1px solid rgba(201,169,110,0.3)' }}>
              <Lock size={12} /> 5.000đ
            </button>
          ) : (
            <span className="flex items-center gap-1 text-xs whitespace-nowrap" style={{ color: '#7ab8a0' }}>
              <Unlock size={12} /> Full track
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
