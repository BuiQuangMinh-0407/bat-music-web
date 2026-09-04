// pages/Home/index.jsx
// Trang chính — gom tất cả sections + quản lý state toàn cục + phím tắt & floating contact
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import Navbar          from '@/components/layout/Navbar';
import Footer          from '@/components/layout/Footer';
import AudioPlayer     from '@/components/player/AudioPlayer';
import BeatsSection    from '@/components/tracks/BeatsSection';
import PaywallModal    from '@/components/modals/PaywallModal';
import CartDrawer      from '@/components/modals/CartDrawer';
import FloatingContact from '@/components/ui/FloatingContact';
import HeroSection     from './HeroSection';
import AboutSection    from './AboutSection';
import CreditsSection  from './CreditsSection';
import ContactSection  from './ContactSection';

import { usePlayer } from '@/hooks/usePlayer';
import { useUnlock } from '@/hooks/useUnlock';
import { useAuth }   from '@/contexts/AuthContext';
import { TRACKS as STATIC_TRACKS } from '@/constants/tracks';
import { PREVIEW_SECONDS } from '@/constants/payment';
import { API } from '@/constants/api';

const DIVIDER = (
  <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(201,169,110,0.12), transparent)' }} />
);

export default function HomePage() {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();

  // ── Tracks: lấy từ MongoDB, fallback sang data tĩnh ────────────────────────
  const [tracks, setTracks] = useState(STATIC_TRACKS);

  useEffect(() => {
    fetch(`${API}/tracks`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data.length > 0) {
          setTracks(data.data.map((t) => ({ ...t, id: t._id })));
        }
      })
      .catch(() => console.warn('API offline, dùng data tĩnh'));
  }, []);

  // ── Unlock (đồng bộ server) ───────────────────────────────────────────────
  const { isUnlocked, unlockedIds, unlock } = useUnlock();

  // ── Paywall ───────────────────────────────────────────────────────────────
  const [paywallTrack, setPaywallTrack] = useState(null);
  const [paywallTracks, setPaywallTracks] = useState([]); // Thanh toán giỏ hàng

  /**
   * Hiện paywall — nhưng kiểm tra đăng nhập trước
   * Chưa login → redirect sang /login
   */
  function handleShowPaywall(track) {
    if (!isLoggedIn) {
      sessionStorage.setItem('bat-pending-track', track.id ?? track._id);
      navigate('/login');
      return;
    }
    setPaywallTrack(track);
  }

  // ── Player (Đồng bộ 100% với HTML5 Audio) ─────────────────────────────────
  const {
    currentTrack, isPlaying, elapsed, duration,
    setIsPlaying, play, pause, togglePlay, prev, next, seek, setVolume,
  } = usePlayer({
    trackList: tracks,
    isUnlocked,
    onPreviewEnd: handleShowPaywall,
  });

  function handleUnlock(id) {
    unlock(id);
    // Xóa khỏi giỏ hàng
    setCartItems((prev) => prev.filter((item) => (item.id ?? item._id) !== id));
    seek(0);
    setIsPlaying(true);
  }

  // ── Cart ─────────────────────────────────────────────────────────────────
  const [cartItems, setCartItems] = useState([]);
  const [cartOpen,  setCartOpen]  = useState(false);

  function handleAddToCart(track) {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    setCartItems((prev) => [...prev, { ...track, cartId: `${track.id ?? track._id}-${Date.now()}` }]);
  }
  function handleRemoveFromCart(cartId) {
    setCartItems((prev) => prev.filter((i) => i.cartId !== cartId));
  }

  function handleCartCheckout(items) {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    setPaywallTracks(items);
    setCartOpen(false);
    setIsPlaying(false);
  }

  // ── Player toggle with paywall guard ─────────────────────────────────────
  function handlePlayerToggle() {
    if (!currentTrack) return;
    if (!isUnlocked(currentTrack) && elapsed >= PREVIEW_SECONDS) {
      handleShowPaywall(currentTrack);
    } else {
      setIsPlaying((p) => !p);
    }
  }

  // ── Global Keyboard Shortcuts (Space: Play/Pause, ArrowLeft/Right: Seek 5s) ──
  useEffect(() => {
    function handleKeyDown(e) {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;

      if (e.code === 'Space') {
        e.preventDefault();
        if (currentTrack) togglePlay();
        else if (tracks.length > 0) play(tracks[0]);
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        seek(Math.max(0, elapsed - 5));
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        seek(elapsed + 5);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentTrack, isPlaying, elapsed, tracks, togglePlay, play, seek]);

  return (
    <div
      className="min-h-screen relative"
      style={{ background: '#08070a', paddingBottom: currentTrack ? '72px' : 0 }}>

      <Navbar cartCount={cartItems.length} onCartClick={() => setCartOpen(true)} />

      <HeroSection onPlayTrack={play} />
      {DIVIDER}

      <BeatsSection
        tracks={tracks}
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        unlockedIds={unlockedIds}
        isUnlocked={isUnlocked}
        onPlay={play}
        onAddToCart={handleAddToCart}
        onShowPaywall={handleShowPaywall}
      />
      {DIVIDER}

      <AboutSection />
      {DIVIDER}

      <CreditsSection />
      {DIVIDER}

      <ContactSection />

      <Footer />

      {/* Floating Contact Widget */}
      <FloatingContact />

      {/* Sticky player */}
      <AudioPlayer
        track={currentTrack}
        isPlaying={isPlaying}
        elapsed={elapsed}
        duration={duration}
        isUnlocked={isUnlocked(currentTrack)}
        onToggle={togglePlay}
        onPrev={prev}
        onNext={next}
        onShowPaywall={handleShowPaywall}
        onSeek={seek}
        onVolumeChange={setVolume}
      />

      {/* Drawers & modals */}
      {cartOpen && (
        <CartDrawer
          items={cartItems}
          onClose={() => setCartOpen(false)}
          onRemove={handleRemoveFromCart}
          onCheckout={handleCartCheckout}
        />
      )}

      {(paywallTrack || paywallTracks.length > 0) && (
        <PaywallModal
          track={paywallTrack}
          tracks={paywallTracks}
          onClose={() => { setPaywallTrack(null); setPaywallTracks([]); }}
          onUnlock={handleUnlock}
        />
      )}
    </div>
  );
}
