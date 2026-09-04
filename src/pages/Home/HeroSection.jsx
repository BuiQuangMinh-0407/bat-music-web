// pages/Home/HeroSection.jsx — Artistic redesign
import { Play, ArrowRight, Lock, ChevronDown, Sparkles } from 'lucide-react';
import VinylRecord        from '@/components/ui/VinylRecord';
import ArtworkPlaceholder from '@/components/ui/ArtworkPlaceholder';
import { ARTIST }         from '@/constants/artist';
import { TRACKS }         from '@/constants/tracks';

const TAGS = ['R&B', 'Lo-Fi', 'Soul', 'Jazzy', 'Melodic'];
const MARQUEE_WORDS = ['R&B', '·', 'LO-FI', '·', 'SOUL', '·', 'PRODUCER', '·', 'SONGWRITER', '·', 'VIỆT NAM', '·'];

/* Màu accent theo genre tag */
const TAG_COLORS = {
  'R&B':     { bg: 'rgba(212,117,107,0.12)', border: 'rgba(212,117,107,0.3)',  color: '#e88fa0' },
  'Lo-Fi':   { bg: 'rgba(122,184,160,0.12)', border: 'rgba(122,184,160,0.3)',  color: '#7ab8a0' },
  'Soul':    { bg: 'rgba(167,139,202,0.12)', border: 'rgba(167,139,202,0.3)',  color: '#a78bca' },
  'Jazzy':   { bg: 'rgba(116,184,212,0.12)', border: 'rgba(116,184,212,0.3)',  color: '#74b8d4' },
  'Melodic': { bg: 'rgba(201,169,110,0.12)', border: 'rgba(201,169,110,0.3)',  color: '#c9a96e' },
};

export default function HeroSection({ onPlayTrack }) {
  const featured = TRACKS.find((t) => t.featured) ?? TRACKS[0];

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center overflow-hidden"
      style={{ paddingTop: '5rem' }}>

      {/* ── Background artwork ────────────────────────────────────────────── */}
      {/* Big ambient glow orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Gold orb top-left */}
        <div className="orb orb-gold w-[600px] h-[600px] -top-32 -left-32 opacity-70" />
        {/* Violet orb bottom-right */}
        <div className="orb orb-violet w-[500px] h-[500px] -bottom-20 -right-20 opacity-60" />
        {/* Rose orb center */}
        <div className="orb orb-rose w-[400px] h-[400px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-40" />
        {/* Teal orb left middle */}
        <div className="orb orb-teal w-[300px] h-[300px] top-1/3 -left-20 opacity-30" />

        {/* Grid lines (artistic) */}
        <div className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(201,169,110,0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(201,169,110,0.03) 1px, transparent 1px)
            `,
            backgroundSize: '80px 80px',
          }}
        />
      </div>

      {/* Top divider */}
      <div className="absolute top-0 left-0 right-0 h-px pointer-events-none"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(201,169,110,0.4), rgba(167,139,202,0.4), transparent)' }} />

      {/* Scrolling marquee bottom */}
      <div className="absolute bottom-20 left-0 right-0 overflow-hidden opacity-[0.06] pointer-events-none select-none">
        <div className="marquee-inner">
          {Array(4).fill(MARQUEE_WORDS).flat().map((word, i) => (
            <span key={i} className="text-6xl font-black font-display mr-8 tracking-widest text-white">
              {word}
            </span>
          ))}
        </div>
      </div>

      {/* ── Main content ─────────────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center relative z-10 w-full py-16">

        {/* Left: Text */}
        <div className="fade-up">

          {/* Eyebrow */}
          <div className="flex items-center gap-3 mb-6">
            <div className="h-px w-10" style={{ background: 'linear-gradient(90deg, var(--gold), var(--violet))' }} />
            <span className="section-label flex items-center gap-1.5">
              <Sparkles size={11} /> Producer &amp; Songwriter
            </span>
          </div>

          {/* Hero heading */}
          <h1 className="font-display leading-none mb-6">
            <span className="block text-gray-300 text-5xl sm:text-6xl lg:text-7xl mb-1 font-normal tracking-wide">
              Bùi
            </span>
            <span className="block text-6xl sm:text-7xl lg:text-8xl text-gold-shimmer">
              Anh Tú
            </span>
            <span className="block mt-3 text-2xl sm:text-3xl font-display tracking-[0.25em]"
              style={{ color: 'rgba(167,139,202,0.7)' }}>
              BAT
            </span>
          </h1>

          <p className="font-lora text-gray-300 text-lg leading-[1.85] max-w-md mb-8 italic"
            style={{ fontWeight: 400 }}>
            Âm nhạc chạm đến cảm xúc. R&amp;B và Lo-Fi được tạo ra từ trái tim —
            mỗi beat là một câu chuyện riêng.
          </p>

          {/* Genre tags — multi color */}
          <div className="flex flex-wrap gap-2 mb-8">
            {TAGS.map((t) => {
              const c = TAG_COLORS[t] || TAG_COLORS['Melodic'];
              return (
                <span key={t}
                  className="px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase transition-all hover:scale-105"
                  style={{ background: c.bg, border: `1px solid ${c.border}`, color: c.color }}>
                  {t}
                </span>
              );
            })}
          </div>

          {/* Preview notice */}
          <div
            className="flex items-center gap-2 px-4 py-3 rounded-2xl mb-8 text-sm"
            style={{
              background: 'linear-gradient(135deg, rgba(201,169,110,0.07), rgba(167,139,202,0.05))',
              border: '1px solid rgba(201,169,110,0.18)',
            }}>
            <Lock size={13} style={{ color: '#c9a96e', flexShrink: 0 }} />
            <span className="text-gray-400">
              Nghe thử <strong className="text-gold">30 giây miễn phí</strong>
              {' '}— Full track chỉ{' '}
              <strong style={{ color: '#a78bca' }}>5.000đ</strong>
            </span>
          </div>

          {/* CTAs */}
          <div className="flex items-center gap-4 flex-wrap mb-12">
            <a href="#beats" className="btn-gold flex items-center gap-2">
              Khám phá Beats <ArrowRight size={16} />
            </a>
            <button
              id="hero-play-btn"
              onClick={() => onPlayTrack(featured)}
              className="btn-outline flex items-center gap-2">
              <Play size={15} className="fill-current" /> Nghe ngay
            </button>
          </div>

          {/* Stats — colored */}
          <div
            className="flex items-center gap-6 pt-8 flex-wrap"
            style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            {ARTIST.stats.map(({ label, value }, idx) => {
              const statColors = ['#c9a96e', '#a78bca', '#7ab8a0', '#e88fa0'];
              return (
                <div key={label}>
                  <div className="text-2xl font-black leading-none font-display" style={{ color: statColors[idx] }}>
                    {value}
                  </div>
                  <div className="text-gray-600 text-xs mt-1">{label}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Vinyl + Featured card */}
        <div className="flex flex-col items-center gap-8 fade-up-delay-2">

          {/* Vinyl với multi-color glow */}
          <div className="relative">
            <div className="absolute inset-0 rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(201,169,110,0.2) 0%, rgba(167,139,202,0.15) 40%, transparent 70%)',
                filter: 'blur(30px)',
                transform: 'scale(1.3)',
              }}
            />
            <VinylRecord size={280} />
          </div>

          {/* Featured track card — artistic */}
          <div
            className="w-full max-w-sm rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1"
            style={{
              background: 'linear-gradient(135deg, rgba(17,15,26,0.9), rgba(25,22,35,0.85))',
              border: '1px solid rgba(201,169,110,0.2)',
              boxShadow: '0 16px 48px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)',
            }}
            onClick={() => onPlayTrack(featured)}>

            {/* Colored top bar */}
            <div className="h-1 w-full"
              style={{ background: 'linear-gradient(90deg, var(--gold), var(--rose), var(--violet))' }} />

            <div className="p-4">
              <div className="text-xs mb-3 flex items-center gap-1.5"
                style={{ color: '#a78bca' }}>
                <Sparkles size={10} /> ĐANG ĐƯỢC YÊU THÍCH
              </div>

              <div className="flex items-center gap-3">
                <ArtworkPlaceholder
                  color={featured.color}
                  size="md"
                  title={featured.title}
                  imageUrl={featured.imageUrl}
                />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-100 truncate">{featured.title}</div>
                  <div className="text-xs flex items-center gap-1.5 mt-0.5">
                    <Lock size={9} style={{ color: '#c9a96e' }} />
                    <span style={{ color: '#c9a96e' }}>Thử 30s</span>
                    <span className="text-gray-700">·</span>
                    <span className="text-gray-600">{featured.plays}</span>
                  </div>
                </div>
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 transition-all hover:scale-110"
                  style={{ background: 'linear-gradient(135deg, #c9a96e, #e8c98a)', boxShadow: '0 0 20px rgba(201,169,110,0.4)' }}>
                  <Play size={16} className="fill-current ml-0.5" style={{ color: '#07060d' }} />
                </div>
              </div>

              {/* Waveform artistic */}
              <div className="flex items-end gap-0.5 mt-4 h-8">
                {Array.from({ length: 48 }, (_, i) => {
                  const h = Math.max(15, Math.abs(Math.sin(i * 0.35 + 1) * 80 + Math.sin(i * 0.7) * 20));
                  const played = i < 16;
                  const playedColors = ['#c9a96e', '#e88fa0', '#a78bca'];
                  const pColor = playedColors[Math.floor(i / 6) % playedColors.length];
                  return (
                    <div key={i} className="flex-1 rounded-sm"
                      style={{ height: `${h * 0.32}px`, background: played ? pColor : '#2e2940', opacity: played ? 1 : 0.4 }}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll hint */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-30">
        <span className="text-xs text-gray-600 tracking-widest uppercase font-display">Scroll</span>
        <ChevronDown size={16} className="text-gray-600 animate-bounce" />
      </div>
    </section>
  );
}
