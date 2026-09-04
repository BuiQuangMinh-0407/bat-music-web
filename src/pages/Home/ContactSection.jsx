// pages/Home/ContactSection.jsx
// Form liên hệ & Đặt làm Beat Custom trực tiếp tới BAT Music
import { useState } from 'react';
import { Mail, Check, Send, AlertCircle, Phone, MessageSquare } from 'lucide-react';
import { ARTIST } from '@/constants/artist';
import { API } from '@/constants/api';

const REQUEST_TYPES = [
  { value: 'custom-beat', label: '🎵 Đặt Beat Custom (Theo yêu cầu)' },
  { value: 'license',     label: '📜 Mua Bản Quyền Độc Quyền (Exclusive)' },
  { value: 'collab',      label: '🤝 Hợp tác / Features / Thu âm' },
  { value: 'other',       label: '💬 Câu hỏi khác' },
];

const EMPTY_FORM = { name: '', email: '', phone: '', type: 'custom-beat', budget: '', message: '' };

export default function ContactSection() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${API}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (data.success) {
        setSent(true);
        setForm(EMPTY_FORM);
        setTimeout(() => setSent(false), 5000);
      } else {
        throw new Error(data.message || 'Gửi yêu cầu thất bại');
      }
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  }

  function setField(key, val) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  return (
    <section id="contact" className="py-24 px-6 relative overflow-hidden">
      {/* Ambient glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 60% 40% at 50% 100%, rgba(201,169,110,0.08) 0%, transparent 70%)' }}
      />

      <div className="max-w-4xl mx-auto relative">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="section-label mb-3">Liên hệ & Hợp tác</div>
          <h2 className="font-cormorant text-5xl sm:text-6xl font-semibold text-white italic mb-2 leading-tight">
            Cùng tạo ra điều gì đó
          </h2>
          <p
            className="font-cormorant text-gold text-3xl sm:text-4xl italic font-normal"
            style={{
              background: 'linear-gradient(135deg, #c9a96e, #e88fa0, #a78bca)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
            đặc biệt
          </p>
        </div>

        <div className="grid md:grid-cols-5 gap-8">
          {/* Info */}
          <div className="md:col-span-2 flex flex-col gap-6">
            <div className="p-6 rounded-2xl" style={{ background: 'rgba(21,18,28,0.5)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Email Producer</div>
              <a
                href={`mailto:${ARTIST.email}`}
                className="font-semibold text-sm transition-colors block"
                style={{ color: '#c9a96e' }}>
                {ARTIST.email}
              </a>

              <div className="h-px bg-white/5 my-4" />

              <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Thời gian phản hồi</div>
              <div className="text-gray-200 font-medium text-sm">Trong vòng 12 - 24 giờ</div>

              <div className="h-px bg-white/5 my-4" />

              <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Dịch vụ cung cấp</div>
              <ul className="text-xs text-gray-400 space-y-1.5 mt-2">
                <li>✦ Sản xuất Beat độc quyền R&B / Lo-Fi / Soul</li>
                <li>✦ Mix & Master giọng hát / Vocal trackout</li>
                <li>✦ Hợp đồng chuyển nhượng quyền tác giả trọn gói</li>
              </ul>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="md:col-span-3 flex flex-col gap-4">
            {error && (
              <div className="flex items-center gap-2 text-xs p-3 rounded-xl"
                style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}>
                <AlertCircle size={15} className="flex-shrink-0" /> {error}
              </div>
            )}

            {sent && (
              <div className="flex items-center gap-2 text-xs p-4 rounded-xl"
                style={{ background: 'rgba(122,184,160,0.15)', color: '#7ab8a0', border: '1px solid rgba(122,184,160,0.3)' }}>
                <Check size={16} className="flex-shrink-0 text-[#7ab8a0]" />
                <span>Yêu cầu đã được gửi thành công! BAT sẽ liên hệ lại với bạn sớm nhất.</span>
              </div>
            )}

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="contact-name" className="block text-xs text-gray-400 uppercase tracking-wider mb-1.5">
                  Họ và tên *
                </label>
                <input
                  id="contact-name"
                  type="text"
                  required
                  placeholder="VD: Tuấn Anh / Rapper Nickname"
                  value={form.name}
                  onChange={(e) => setField('name', e.target.value)}
                  className="input-field"
                />
              </div>
              <div>
                <label htmlFor="contact-email" className="block text-xs text-gray-400 uppercase tracking-wider mb-1.5">
                  Email nhận phản hồi *
                </label>
                <input
                  id="contact-email"
                  type="email"
                  required
                  placeholder="your-email@example.com"
                  value={form.email}
                  onChange={(e) => setField('email', e.target.value)}
                  className="input-field"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="contact-phone" className="block text-xs text-gray-400 uppercase tracking-wider mb-1.5">
                  Số điện thoại / Zalo (Tùy chọn)
                </label>
                <input
                  id="contact-phone"
                  type="tel"
                  placeholder="0901xxxxxx"
                  value={form.phone}
                  onChange={(e) => setField('phone', e.target.value)}
                  className="input-field"
                />
              </div>
              <div>
                <label htmlFor="contact-budget" className="block text-xs text-gray-400 uppercase tracking-wider mb-1.5">
                  Ngân sách dự tính (VNĐ)
                </label>
                <input
                  id="contact-budget"
                  type="text"
                  placeholder="VD: 500k - 2 triệu"
                  value={form.budget}
                  onChange={(e) => setField('budget', e.target.value)}
                  className="input-field"
                />
              </div>
            </div>

            <div>
              <label htmlFor="contact-type" className="block text-xs text-gray-400 uppercase tracking-wider mb-1.5">
                Nhu cầu của bạn
              </label>
              <select
                id="contact-type"
                value={form.type}
                onChange={(e) => setField('type', e.target.value)}
                className="input-field">
                {REQUEST_TYPES.map(({ value, label }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="contact-message" className="block text-xs text-gray-400 uppercase tracking-wider mb-1.5">
                Mô tả chi tiết yêu cầu *
              </label>
              <textarea
                id="contact-message"
                rows={4}
                required
                placeholder="Mô tả vibe bài hát, nghệ sĩ tham khảo (Ref track), tiến độ mong muốn hoàn thành..."
                value={form.message}
                onChange={(e) => setField('message', e.target.value)}
                className="input-field"
                style={{ height: 'auto', paddingTop: 10, paddingBottom: 10 }}
              />
            </div>

            <button
              id="contact-submit"
              type="submit"
              disabled={loading}
              className="btn-gold w-full py-3.5 flex items-center justify-center gap-2 text-sm font-bold shadow-lg transition-all"
              style={{ opacity: loading ? 0.7 : 1 }}>
              {loading ? (
                <>
                  <span className="animate-spin inline-block w-4 h-4 border-2 border-black/30 border-t-black rounded-full" />
                  Đang gửi...
                </>
              ) : sent ? (
                <>
                  <Check size={16} /> Đã gửi thành công!
                </>
              ) : (
                <>
                  <Send size={16} /> Gửi yêu cầu tới BAT
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
