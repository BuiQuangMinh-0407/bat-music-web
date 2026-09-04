// hooks/usePlayer.js
// Trình phát nhạc chuẩn xác 100%:
// 1. Hỗ trợ file MP3 thật (HTML5 Audio) + Demo timer nếu track chưa có file MP3
// 2. Đồng bộ 100% giữa State (Play/Pause) và Audio (.play() / .pause())
// 3. Đúng 30s tự động DỪNG và RESET về 0:00 đối với bài chưa mua
import { useState, useEffect, useRef, useCallback } from 'react';
import { TRACKS as STATIC_TRACKS } from '@/constants/tracks';
import { PREVIEW_SECONDS } from '@/constants/payment';
import { getMediaUrl } from '@/constants/api';

export function usePlayer({
  trackList = STATIC_TRACKS,
  isUnlocked = () => false,
  onPreviewEnd,
} = {}) {
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying,    setIsPlaying]    = useState(false);
  const [elapsed,      setElapsed]      = useState(0);
  const [duration,     setDuration]     = useState(0);
  const [volume,       setVolumeState]  = useState(0.8);

  const audioRef          = useRef(null);
  const timerRef          = useRef(null);
  const currentTrackRef   = useRef(null);
  const isUnlockedRef     = useRef(isUnlocked);
  const onPreviewEndRef   = useRef(onPreviewEnd);

  // Cập nhật refs mới nhất
  useEffect(() => { currentTrackRef.current = currentTrack; }, [currentTrack]);
  useEffect(() => { isUnlockedRef.current = isUnlocked; }, [isUnlocked]);
  useEffect(() => { onPreviewEndRef.current = onPreviewEnd; }, [onPreviewEnd]);

  // ── Helper: Play/Pause an toàn ────────────────────────────────────────────
  const safePlay = useCallback((audio) => {
    if (!audio) return;
    const promise = audio.play();
    if (promise !== undefined) {
      promise
        .then(() => setIsPlaying(true))
        .catch((err) => {
          if (err.name !== 'AbortError') {
            console.warn('⚠️ Lỗi phát audio:', err.message);
          }
          setIsPlaying(false);
        });
    }
  }, []);

  const safePause = useCallback((audio) => {
    if (!audio) return;
    audio.pause();
    setIsPlaying(false);
  }, []);

  // ── Khởi tạo đối tượng HTML5 Audio DUY NHẤT (Chỉ chạy 1 lần khi Mount) ────
  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'auto';
    audio.volume = volume;
    audioRef.current = audio;

    const handleTimeUpdate = () => {
      if (!audioRef.current) return;
      const track = currentTrackRef.current;
      const currentSec = Math.floor(audio.currentTime);

      // Kiểm tra mốc 30s nếu chưa mở khóa
      const unlocked = track ? isUnlockedRef.current(track) : false;
      if (!unlocked && audio.currentTime >= PREVIEW_SECONDS) {
        // DỪNG VÀ RESET VỀ 0:00
        audio.pause();
        audio.currentTime = 0;
        setElapsed(0);
        setIsPlaying(false);

        if (onPreviewEndRef.current && track) {
          onPreviewEndRef.current(track);
        }
        return;
      }

      setElapsed(currentSec);
    };

    const handleLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(Math.floor(audio.duration));
      }
    };

    const handlePlay = () => {
      setIsPlaying(true);
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setElapsed(0);
      audio.currentTime = 0;
    };

    const handleError = (e) => {
      console.warn('⚠️ Audio load error:', e);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      clearInterval(timerRef.current);
      audio.pause();
      audio.src = '';
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audioRef.current = null;
    };
  }, []);

  // ── Quản lý Fallback Timer khi track không có file audio MP3 thật ──────────
  useEffect(() => {
    clearInterval(timerRef.current);

    if (isPlaying && currentTrack && !currentTrack.audioUrl) {
      timerRef.current = setInterval(() => {
        setElapsed((prev) => {
          const nextVal = prev + 1;
          const unlocked = isUnlockedRef.current(currentTrack);

          if (!unlocked && nextVal >= PREVIEW_SECONDS) {
            clearInterval(timerRef.current);
            setIsPlaying(false);
            if (onPreviewEndRef.current && currentTrack) {
              onPreviewEndRef.current(currentTrack);
            }
            return 0; // Reset về 0s
          }

          return nextVal;
        });
      }, 1000);
    }

    return () => clearInterval(timerRef.current);
  }, [isPlaying, currentTrack]);

  // ── Đổi sang bài hát mới ──────────────────────────────────────────────────
  const changeTrack = useCallback((track) => {
    const audio = audioRef.current;
    clearInterval(timerRef.current);

    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    setElapsed(0);

    const hasAudio = !!track.audioUrl;
    if (hasAudio && audio) {
      const fullUrl = getMediaUrl(track.audioUrl);
      console.log('🎵 Đang nạp bài:', track.title, fullUrl);
      audio.src = fullUrl;
      audio.load();

      safePlay(audio);
      setDuration(track.durationSec || 180);
    } else {
      if (audio) audio.src = '';
      setDuration(track.durationSec || 180);
      setIsPlaying(true); // Chạy fallback timer
    }

    setCurrentTrack(track);
  }, [safePlay]);

  // ── Toggle Play / Pause ───────────────────────────────────────────────────
  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    const track = currentTrackRef.current;
    if (!track) return;

    const hasAudio = !!track.audioUrl;

    if (hasAudio && audio) {
      if (audio.paused) {
        const unlocked = isUnlockedRef.current(track);
        if (!unlocked && audio.currentTime >= PREVIEW_SECONDS) {
          audio.currentTime = 0;
          setElapsed(0);
        }
        safePlay(audio);
      } else {
        safePause(audio);
      }
    } else {
      // Toggle cho Timer Mode
      setIsPlaying((prev) => {
        const nextState = !prev;
        if (nextState) {
          const unlocked = isUnlockedRef.current(track);
          if (!unlocked && elapsed >= PREVIEW_SECONDS) {
            setElapsed(0);
          }
        }
        return nextState;
      });
    }
  }, [elapsed, safePlay, safePause]);

  // ── Play Track (nếu bấm cùng bài thì toggle, khác bài thì chuyển bài) ─────
  const play = useCallback((track) => {
    if (!track) return;

    const cur = currentTrackRef.current;
    const sameId = cur && (
      (cur.id && cur.id === track.id) ||
      (cur._id && cur._id === track._id) ||
      ((cur.id ?? cur._id) === (track.id ?? track._id))
    );

    if (sameId) {
      togglePlay();
    } else {
      changeTrack(track);
    }
  }, [togglePlay, changeTrack]);

  // ── Dừng phát ─────────────────────────────────────────────────────────────
  const pause = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      safePause(audio);
    }
    clearInterval(timerRef.current);
    setIsPlaying(false);
  }, [safePause]);

  // ── Tua nhạc ──────────────────────────────────────────────────────────────
  const seek = useCallback((sec) => {
    const audio = audioRef.current;
    const track = currentTrackRef.current;
    const s = Math.max(0, Math.floor(sec));

    const unlocked = track ? isUnlockedRef.current(track) : false;
    if (!unlocked && s >= PREVIEW_SECONDS) {
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
      setElapsed(0);
      setIsPlaying(false);
      if (onPreviewEndRef.current && track) {
        onPreviewEndRef.current(track);
      }
      return;
    }

    setElapsed(s);
    if (audio && track?.audioUrl) {
      audio.currentTime = s;
    }
  }, []);

  // ── Âm lượng ──────────────────────────────────────────────────────────────
  const setVolume = useCallback((pct) => {
    const val = Math.max(0, Math.min(1, pct / 100));
    setVolumeState(val);
    if (audioRef.current) {
      audioRef.current.volume = val;
    }
  }, []);

  const list = trackList && trackList.length > 0 ? trackList : STATIC_TRACKS;

  const prev = useCallback(() => {
    const cur = currentTrackRef.current;
    if (!cur) return;
    const idx = list.findIndex((t) => (t.id ?? t._id) === (cur.id ?? cur._id));
    const p   = list[(idx - 1 + list.length) % list.length];
    changeTrack(p);
  }, [list, changeTrack]);

  const next = useCallback(() => {
    const cur = currentTrackRef.current;
    if (!cur) return;
    const idx = list.findIndex((t) => (t.id ?? t._id) === (cur.id ?? cur._id));
    const n   = list[(idx + 1) % list.length];
    changeTrack(n);
  }, [list, changeTrack]);

  return {
    currentTrack,
    isPlaying,
    elapsed,
    duration,
    setIsPlaying,
    play,
    pause,
    togglePlay,
    seek,
    setVolume,
    prev,
    next,
  };
}
