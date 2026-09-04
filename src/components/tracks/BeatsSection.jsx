// components/tracks/BeatsSection.jsx
// Danh sách beats với Live Search, bộ lọc thể loại và Bảng giá bản quyền
import { useState } from 'react';
import { Lock, Zap, Search, X, HelpCircle, Sparkles, Music } from 'lucide-react';
import TrackRow from './TrackRow';
import LicenseModal from '@/components/modals/LicenseModal';
import { useStaggerReveal } from '@/hooks/useScrollReveal';

const GENRES = ['All', 'R&B', 'Lo-Fi', 'Hip-Hop', 'Pop', 'Soul'];

export default function BeatsSection({
  tracks = [],
  currentTrack,
  isPlaying,
  unlockedIds,
  isUnlocked,
  onPlay,
  onAddToCart,
  onShowPaywall,
}) {
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [showLicense, setShowLicense] = useState(false);
  const listRef = useStaggerReveal();

  // Lọc theo thể loại & tìm kiếm Live Search
  const displayed = tracks.filter((t) => {
    const matchGenre = filter === 'All' || t.genre?.toLowerCase() === filter.toLowerCase();
    const query = search.trim().toLowerCase();
    if (!query) return matchGenre;

    const tagsStr = Array.isArray(t.tags) ? t.tags.join(' ') : (t.tags || '');
    const matchSearch =
      t.title?.toLowerCase().includes(query) ||
      (t.producer || '').toLowerCase().includes(query) ||
      String(t.bpm || '').includes(query) ||
      (t.key || '').toLowerCase().includes(query) ||
      tagsStr.toLowerCase().includes(query);

    return matchGenre && matchSearch;
  });

  return (
    <section id="beats" className="py-24 px-6 relative">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <div className="section-label">Beats Marketplace</div>
            <h2
              className="font-grotesk text-4xl sm:text-5xl font-bold tracking-tight"
              style={{ color: '#fff', letterSpacing: '-0.02em' }}>
              Beats &amp; Tracks
            </h2>
          </div>

          {/* Quick License & Custom Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowLicense(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-gray-300 hover:text-white transition-all hover:bg-white/5 border border-white/10"
              title="Xem bảng giá và quyền hạn bản quyền">
              <HelpCircle size={14} className="text-gold" /> Bảng Giá Bản Quyền
            </button>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6 items-stretch sm:items-center">
          {/* Live Search Input */}
          <div className="relative flex-1">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
              <Search size={16} />
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo tên bài hát, BPM, Tone, tags (vd: mưa, 90 bpm, Am)..."
              className="w-full pl-10 pr-9 py-2.5 rounded-2xl text-xs sm:text-sm text-gray-200 placeholder-gray-600 outline-none transition-all"
              style={{
                background: 'rgba(21,18,28,0.7)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white p-0.5">
                <X size={14} />
              </button>
            )}
          </div>

          {/* Genre filter pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {GENRES.map((g) => (
              <button
                key={g}
                id={`filter-${g.toLowerCase()}`}
                onClick={() => setFilter(g)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200"
                style={
                  filter === g
                    ? {
                        background: 'rgba(201,169,110,0.15)',
                        color: '#c9a96e',
                        border: '1px solid rgba(201,169,110,0.35)',
                      }
                    : {
                        color: '#6b6480',
                        border: '1px solid rgba(255,255,255,0.06)',
                        background: 'rgba(255,255,255,0.02)',
                      }
                }>
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* Preview policy banner */}
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-2xl mb-6"
          style={{ background: 'rgba(201,169,110,0.06)', border: '1px solid rgba(201,169,110,0.15)' }}>
          <Lock size={14} style={{ color: '#c9a96e', flexShrink: 0 }} />
          <p className="text-xs sm:text-sm text-gray-400">
            Tất cả bài hát được <strong className="text-gray-200">nghe thử miễn phí 30 giây</strong>. Mở khoá nghe &amp; tải full chỉ với{' '}
            <strong style={{ color: '#c9a96e' }}>5.000đ / bài vĩnh viễn</strong> — quét mã VietQR tự động.
          </p>
          <Zap size={14} style={{ color: '#c9a96e', flexShrink: 0 }} />
        </div>

        {/* Column header */}
        <div className="flex items-center gap-3 px-4 mb-2 text-[11px] text-gray-500 uppercase tracking-wider font-semibold">
          <div className="w-6 text-center" />
          <div className="w-10 flex-shrink-0" />
          <div className="w-12 flex-shrink-0" />
          <div className="flex-1">Tên Beat</div>
          <div className="hidden md:block w-44 flex-shrink-0 text-center">BPM · Key · Thời lượng</div>
          <div className="hidden lg:block w-20 flex-shrink-0">Lượt nghe</div>
          <div className="hidden sm:block w-8 flex-shrink-0" />
          <div className="w-24 flex-shrink-0 text-right">Mở khoá</div>
        </div>
        <div
          className="h-px mb-3"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(201,169,110,0.15), transparent)' }}
        />

        {/* Track list */}
        {displayed.length === 0 ? (
          <div className="py-16 text-center flex flex-col items-center justify-center rounded-2xl border border-white/5 bg-white/[0.01]">
            <Music size={36} className="text-gray-700 mb-2" />
            <p className="text-sm text-gray-400 font-medium">Không tìm thấy bài beat nào phù hợp</p>
            <p className="text-xs text-gray-600 mt-1">Hãy thử tìm kiếm với từ khóa khác hoặc chuyển thể loại</p>
            <button
              onClick={() => { setSearch(''); setFilter('All'); }}
              className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold bg-gold/10 text-gold border border-gold/20 hover:bg-gold/20 transition-all">
              Đặt lại bộ lọc
            </button>
          </div>
        ) : (
          <div ref={listRef} className="flex flex-col gap-2">
            {displayed.map((track, i) => (
              <div key={track.id ?? track._id} data-stagger>
                <TrackRow
                  track={track}
                  index={i}
                  isActive={
                    (currentTrack?.id && currentTrack.id === track.id) ||
                    (currentTrack?._id && currentTrack._id === track._id)
                  }
                  isPlaying={isPlaying}
                  isUnlocked={isUnlocked(track)}
                  onPlay={onPlay}
                  onAddToCart={onAddToCart}
                  onShowPaywall={onShowPaywall}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* License Modal */}
      {showLicense && <LicenseModal onClose={() => setShowLicense(false)} />}
    </section>
  );
}
