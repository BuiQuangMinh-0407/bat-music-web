// components/ui/FloatingContact.jsx
// Nút liên hệ nhanh nổi góc màn hình (Zalo, Messenger, Hotline, Đặt Beat)
import { useState } from 'react';
import { MessageCircle, Phone, Music, X, ChevronUp, Sparkles, Send } from 'lucide-react';
import { ARTIST } from '@/constants/artist';

export default function FloatingContact() {
  const [open, setOpen] = useState(false);

  function scrollToContact() {
    setOpen(false);
    const el = document.getElementById('contact');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }

  return (
    <div className="fixed bottom-24 right-5 z-40 flex flex-col items-end">
      {/* Menu popup */}
      {open && (
        <div
          className="mb-3 w-64 rounded-2xl glass p-3 shadow-2xl flex flex-col gap-2 animate-fadeUp"
          style={{
            border: '1px solid rgba(201,169,110,0.25)',
            background: 'rgba(15,13,22,0.95)',
            boxShadow: '0 12px 35px rgba(0,0,0,0.7)',
          }}>
          <div className="flex items-center justify-between pb-2 border-b border-white/5 px-2">
            <span className="text-xs font-bold text-gray-200 flex items-center gap-1.5">
              <Sparkles size={13} className="text-gold" /> Hỗ trợ & Mua Beat
            </span>
            <button
              onClick={() => setOpen(false)}
              className="text-gray-500 hover:text-white p-1 rounded-lg">
              <X size={13} />
            </button>
          </div>

          {/* Zalo Button */}
          <a
            href="https://zalo.me/0389445060"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-3 p-2.5 rounded-xl transition-all hover:bg-white/5 text-xs text-gray-300 hover:text-white group"
            style={{ background: 'rgba(0,136,255,0.08)', border: '1px solid rgba(0,136,255,0.15)' }}>
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold text-xs">
              Zalo
            </div>
            <div>
              <div className="font-semibold text-white group-hover:text-blue-400 transition-colors">Chat qua Zalo</div>
              <div className="text-[10px] text-gray-500">Phản hồi tức thì</div>
            </div>
          </a>

          {/* Messenger Button */}
          <a
            href={ARTIST.socials?.facebook || 'https://facebook.com'}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-3 p-2.5 rounded-xl transition-all hover:bg-white/5 text-xs text-gray-300 hover:text-white group"
            style={{ background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.15)' }}>
            <div className="w-8 h-8 rounded-lg bg-purple-600/20 text-purple-400 flex items-center justify-center">
              <MessageCircle size={15} />
            </div>
            <div>
              <div className="font-semibold text-white group-hover:text-purple-400 transition-colors">Facebook Messenger</div>
              <div className="text-[10px] text-gray-500">Tư vấn chọn beat</div>
            </div>
          </a>

          {/* Quick Custom Beat Scroll */}
          <button
            onClick={scrollToContact}
            className="flex items-center gap-3 p-2.5 rounded-xl transition-all hover:bg-white/5 text-xs text-gray-300 hover:text-white group text-left"
            style={{ background: 'rgba(201,169,110,0.08)', border: '1px solid rgba(201,169,110,0.2)' }}>
            <div className="w-8 h-8 rounded-lg bg-gold/20 text-gold flex items-center justify-center">
              <Music size={15} />
            </div>
            <div>
              <div className="font-semibold text-gold">Đặt Beat Custom</div>
              <div className="text-[10px] text-gray-500">Làm nhạc theo yêu cầu</div>
            </div>
          </button>
        </div>
      )}

      {/* Main floating bubble */}
      <button
        onClick={() => setOpen(!open)}
        className="w-13 h-13 rounded-full flex items-center justify-center shadow-2xl transition-all hover:scale-110 active:scale-95 group relative"
        style={{
          width: 52,
          height: 52,
          background: 'linear-gradient(135deg, #c9a96e, #e8c98a)',
          boxShadow: '0 8px 25px rgba(201,169,110,0.4)',
        }}
        title="Liên hệ & Đặt Beat">
        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-[#07060d] animate-ping" />
        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-[#07060d]" />
        {open ? (
          <X size={22} className="text-black" />
        ) : (
          <MessageCircle size={24} className="text-black fill-current" />
        )}
      </button>
    </div>
  );
}
