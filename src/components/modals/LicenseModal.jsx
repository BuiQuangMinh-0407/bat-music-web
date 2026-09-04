// components/modals/LicenseModal.jsx
// Bảng so sánh các gói Bản Quyền Beat (Lease vs Exclusive)
import { X, Check, ShieldCheck, Sparkles, HelpCircle } from 'lucide-react';

const LICENSES = [
  {
    id: 'stream',
    name: 'Mở Khóa Nghe Full',
    price: '5.000 đ',
    unit: '/ bài vĩnh viễn',
    color: '#7ab8a0',
    popular: false,
    features: [
      'Nghe toàn bộ bài không giới hạn',
      'Chất lượng âm thanh 320kbps MP3',
      'Tải về nghe offline trên mọi thiết bị',
      'Dùng cho mục đích phi thương mại',
    ],
  },
  {
    id: 'mp3-lease',
    name: 'MP3 Lease (Cơ Bản)',
    price: '$29.99',
    unit: '/ bản quyền thương mại',
    color: '#c9a96e',
    popular: true,
    features: [
      'File chất lượng cao Mastered MP3',
      'Thu âm và phát hành lên Spotify, YouTube, Apple Music',
      'Giới hạn 100.000 lượt stream',
      'Tặng kèm bản quyền biểu diễn phi thương mại',
    ],
  },
  {
    id: 'wav-trackout',
    name: 'WAV + Stems (Trackout)',
    price: '$99.99',
    unit: '/ bản quyền phòng thu',
    color: '#a78bca',
    popular: false,
    features: [
      'Đầy đủ file 24-bit WAV & Tách từng nhạc cụ (Stems)',
      'Dành cho Producer / Sound Engineer mix & master lại',
      'Giới hạn 500.000 lượt stream',
      'Quyền phát sóng trên Radio & TV',
    ],
  },
  {
    id: 'exclusive',
    name: 'Exclusive (Độc Quyền)',
    price: 'Liên hệ',
    unit: '/ sở hữu vĩnh viễn',
    color: '#e88fa0',
    popular: false,
    features: [
      'Gỡ beat khỏi sàn — bạn là chủ sở hữu duy nhất',
      'Không giới hạn lượt stream, phát sóng & doanh thu',
      'Toàn quyền chuyển nhượng tác quyền âm nhạc',
      'Hỗ trợ chỉnh sửa BPM, Key và cấu trúc beat theo yêu cầu',
    ],
  },
];

export default function LicenseModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md overflow-y-auto">
      <div
        className="w-full max-w-4xl rounded-3xl p-6 sm:p-8 relative my-8"
        style={{
          background: '#120f1a',
          border: '1px solid rgba(201,169,110,0.2)',
          boxShadow: '0 25px 60px rgba(0,0,0,0.8)',
        }}>
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-gray-500 hover:text-white hover:bg-white/5 transition-all">
          <X size={20} />
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <span className="text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-gold/10 text-gold border border-gold/20 mb-3 inline-block">
            Bảng Giá & Quyền Hạn
          </span>
          <h2 className="font-grotesk text-2xl sm:text-3xl font-bold text-white mb-2">
            Các Gói Bản Quyền Beat Tại BAT Music
          </h2>
          <p className="text-xs sm:text-sm text-gray-400 max-w-lg mx-auto">
            Lựa chọn gói bản quyền phù hợp với quy mô dự án âm nhạc của bạn.
          </p>
        </div>

        {/* Pricing Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {LICENSES.map((lic) => (
            <div
              key={lic.id}
              className={`p-5 rounded-2xl flex flex-col justify-between relative transition-all ${
                lic.popular ? 'ring-2 ring-gold/40' : ''
              }`}
              style={{
                background: 'rgba(21,18,28,0.7)',
                border: '1px solid rgba(255,255,255,0.06)',
              }}>
              {lic.popular && (
                <div
                  className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
                  style={{ background: 'linear-gradient(135deg, #c9a96e, #e8c98a)', color: '#000' }}>
                  Phổ biến nhất
                </div>
              )}

              <div>
                <h3 className="font-bold text-sm text-gray-200 mb-1">{lic.name}</h3>
                <div className="flex items-baseline gap-1 my-3">
                  <span className="text-2xl font-black" style={{ color: lic.color }}>
                    {lic.price}
                  </span>
                  <span className="text-[10px] text-gray-500">{lic.unit}</span>
                </div>

                <div className="h-px bg-white/5 my-3" />

                <ul className="space-y-2.5">
                  {lic.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-[11px] text-gray-300 leading-snug">
                      <Check size={13} className="flex-shrink-0 mt-0.5" style={{ color: lic.color }} />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6 pt-3 border-t border-white/5">
                <button
                  onClick={onClose}
                  className="w-full py-2.5 rounded-xl text-xs font-bold transition-all hover:scale-[1.02] active:scale-[0.98]"
                  style={{
                    background: lic.popular
                      ? 'linear-gradient(135deg, #c9a96e, #e8c98a)'
                      : `${lic.color}15`,
                    color: lic.popular ? '#07060d' : lic.color,
                    border: `1px solid ${lic.color}30`,
                  }}>
                  {lic.id === 'exclusive' ? 'Liên Hệ Ngay' : 'Chọn Gói Này'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
