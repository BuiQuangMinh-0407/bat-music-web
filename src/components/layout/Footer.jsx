// components/layout/Footer.jsx
import { Mail } from 'lucide-react';
import { ARTIST } from '@/constants/artist';

export default function Footer() {
  return (
    <footer style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>

      {/* ── Beat Custom CTA Banner ── */}
      <div
        className="py-14 px-6 text-center"
        style={{
          background: 'linear-gradient(135deg, rgba(201,169,110,0.07) 0%, rgba(167,139,202,0.05) 50%, rgba(122,184,160,0.05) 100%)',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
        }}>
        <p className="text-sm mb-2" style={{ color: 'rgba(232,224,213,0.45)', letterSpacing: '0.05em' }}>
          Cần beat custom riêng?
        </p>
        <a
          href="#contact"
          className="btn-outline inline-flex items-center gap-2 mx-auto">
          <Mail size={14} /> Yêu cầu beat custom
        </a>
      </div>

      {/* ── Footer links ── */}
      <div className="py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">

          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs tracking-widest"
              style={{ background: 'linear-gradient(135deg, #c9a96e, #e8c98a)', color: '#07060d' }}>
              BAT
            </div>
            <span className="text-gray-600 text-sm">
              © {new Date().getFullYear()} {ARTIST.fullName}. All rights reserved.
            </span>
          </div>

          <div className="flex items-center gap-6">
            {['Điều khoản', 'Bảo mật', 'License'].map((l) => (
              <a key={l} href="#" className="text-xs text-gray-700 hover:text-brand transition-colors">
                {l}
              </a>
            ))}
            <a href="/admin" className="text-xs text-gray-700 hover:text-gray-500 transition-colors">
              Admin ↗
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
