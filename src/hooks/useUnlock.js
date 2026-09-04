// ─────────────────────────────────────────────────────────────────────────────
// hooks/useUnlock.js
// Quản lý bài đã mở khoá — đồng bộ với server khi đã login
// Mua 1 lần → nghe vĩnh viễn (lưu trên MongoDB theo tài khoản)
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { API } from '@/constants/api';

export function useUnlock() {
  const { user, token, isLoggedIn } = useAuth();
  const [unlockedIds, setUnlockedIds] = useState(new Set());

  // ── Khi user login hoặc thay đổi → load unlocked tracks từ server ────────
  useEffect(() => {
    if (isLoggedIn && user?.unlockedTracks) {
      setUnlockedIds(new Set(user.unlockedTracks));
    } else {
      setUnlockedIds(new Set());
    }
  }, [isLoggedIn, user]);

  /** Kiểm tra 1 track đã được mở khoá chưa */
  const isUnlocked = useCallback(
    (track) => {
      if (!track) return false;
      const id = track.id ?? track._id;
      return unlockedIds.has(id);
    },
    [unlockedIds],
  );

  /** Mở khoá 1 track — lưu lên server (vĩnh viễn) */
  const unlock = useCallback(
    async (trackId) => {
      if (!isLoggedIn || !token) return;

      // Cập nhật UI ngay lập tức
      setUnlockedIds((prev) => {
        const next = new Set(prev);
        next.add(trackId);
        return next;
      });

      // Gửi lên server để lưu vĩnh viễn
      try {
        const res = await fetch(`${API}/auth/unlock-track`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ trackId }),
        });
        const data = await res.json();
        if (data.success && data.unlockedTracks) {
          setUnlockedIds(new Set(data.unlockedTracks));
        }
      } catch (err) {
        console.error('Lỗi unlock track:', err);
      }
    },
    [isLoggedIn, token],
  );

  return { unlockedIds, isUnlocked, unlock };
}
