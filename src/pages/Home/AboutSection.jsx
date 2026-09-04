// pages/Home/AboutSection.jsx
import VinylRecord from '@/components/ui/VinylRecord';
import { ARTIST }  from '@/constants/artist';
import { useScrollReveal } from '@/hooks/useScrollReveal';

export default function AboutSection() {
  const ref = useScrollReveal({ y: 32 });
  return (
    <section ref={ref} id="about" className="py-24 px-6 relative overflow-hidden">
      {/* Ambient glow */}
      <div
        className="absolute right-0 top-0 w-1/2 h-full pointer-events-none opacity-5"
        style={{ background: 'radial-gradient(ellipse at right, #c9a96e, transparent)' }}
      />

      <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center">

        {/* Left: vinyl + stats */}
        <div className="flex flex-col items-center gap-6">
          <VinylRecord size={320} color="#d4756b" />

          <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
            {ARTIST.stats.map(({ label, value }) => (
              <div
                key={label}
                className="p-4 rounded-2xl text-center"
                style={{ background: 'rgba(201,169,110,0.05)', border: '1px solid rgba(201,169,110,0.12)' }}>
                <div className="text-gold font-black text-2xl">{value}</div>
                <div className="text-gray-600 text-xs mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: text + skills */}
        <div>
          <div className="section-label mb-4">Về BAT</div>
          <h2 className="font-display text-4xl sm:text-5xl text-white italic mb-2">Câu chuyện</h2>
          <h3 className="text-gold font-display text-2xl italic mb-8">của Bùi Anh Tú</h3>

          <p className="text-gray-400 text-lg leading-relaxed mb-6">{ARTIST.bio}</p>
          <p className="text-gray-500 leading-relaxed mb-10">
            Mỗi beat được tạo ra với sự chăm chút tỉ mỉ — từng lớp âm thanh, từng chord
            progression đều mang dấu ấn cá nhân.
          </p>

          {/* Skill bars */}
          <div className="space-y-4">
            {ARTIST.skills.map(({ label, pct }) => (
              <div key={label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-300">{label}</span>
                  <span className="font-semibold" style={{ color: '#c9a96e' }}>{pct}%</span>
                </div>
                <div className="h-1.5 rounded-full" style={{ background: '#1c1826' }}>
                  <div className="h-full rounded-full progress-gold" style={{ width: `${pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
