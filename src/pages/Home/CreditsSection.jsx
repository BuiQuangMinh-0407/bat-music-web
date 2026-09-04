// pages/Home/CreditsSection.jsx
import { Award } from 'lucide-react';
import { COLLABS, ARTIST } from '@/constants/artist';

export default function CreditsSection() {
  return (
    <section id="credits" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="text-center mb-14">
          <div className="section-label mb-3 flex items-center justify-center gap-2">
            <Award size={12} /> Credits
          </div>
          <h2 className="font-display text-4xl sm:text-5xl text-white italic mb-3">
            Đã hợp tác cùng
          </h2>
        </div>

        {/* Collab grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {COLLABS.map(({ id, name, role, tracks, color }) => (
            <div key={id} className="collab-card group">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center font-black text-lg transition-all group-hover:scale-110"
                style={{
                  background: `linear-gradient(135deg, ${color}44, ${color}22)`,
                  border:     `2px solid ${color}33`,
                  color,
                }}>
                {name[0]}
              </div>
              <div>
                <div className="font-semibold text-gray-200 text-sm">{name}</div>
                <div className="text-gray-600 text-xs">{role}</div>
                <div className="text-xs mt-1 font-medium" style={{ color }}>
                  {tracks} tracks
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Platforms */}
        <div
          className="mt-16 pt-12"
          style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <p className="text-center text-xs text-gray-700 uppercase tracking-widest mb-6">
            Được nghe trên
          </p>
          <div className="flex items-center justify-center gap-8 flex-wrap opacity-30">
            {ARTIST.platforms.map((p) => (
              <span key={p} className="text-gray-400 font-semibold text-sm tracking-wider">{p}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
