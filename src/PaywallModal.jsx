import React, { useState } from 'react';
import { X, Lock, CheckCircle, Copy, Check, Smartphone, Building2, Music2 } from 'lucide-react';

// Thông tin thanh toán demo — bạn thay bằng thông tin thật
const PAYMENT_INFO = {
  momo: {
    phone: '0901234567',
    name: 'BÙI ANH TÚ',
    note: 'BAT Music - Mở khoá nhạc',
  },
  zalopay: {
    phone: '0901234567',
    name: 'BÙI ANH TÚ',
    note: 'BAT Music - Mở khoá nhạc',
  },
  bank: {
    bankName: 'Vietcombank',
    accountNumber: '1234567890',
    accountName: 'BUI ANH TU',
    branch: 'Chi nhánh TP.HCM',
    note: 'BAT Music mo khoa nhac',
  },
};

const PRICE = 5000; // VNĐ

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  function handleCopy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }
  return (
    <button
      onClick={handleCopy}
      className="p-1.5 rounded-lg transition-all flex-shrink-0"
      style={{ color: copied ? '#7ab8a0' : '#6b6480', background: copied ? 'rgba(122,184,160,0.1)' : 'transparent' }}
    >
      {copied ? <Check size={13} /> : <Copy size={13} />}
    </button>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between py-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
      <span className="text-xs text-gray-600">{label}</span>
      <div className="flex items-center gap-1.5">
        <span className="text-sm font-semibold text-gray-200">{value}</span>
        <CopyButton text={value} />
      </div>
    </div>
  );
}

export default function PaywallModal({ track, onClose, onUnlock }) {
  const [tab, setTab]         = useState('momo');
  const [confirming, setConfirming] = useState(false);
  const [confirmed, setConfirmed]   = useState(false);

  if (!track) return null;

  function handleConfirm() {
    setConfirming(true);
    // Giả lập xác minh (1.5s) — sau này gọi API thật
    setTimeout(() => {
      setConfirmed(true);
      setConfirming(false);
      setTimeout(() => {
        onUnlock(track._id || track.id);
        onClose();
      }, 1500);
    }, 1500);
  }

  const tabs = [
    { id: 'momo',    label: 'MoMo',     icon: <Smartphone size={14} /> },
    { id: 'zalopay', label: 'ZaloPay',  icon: <Smartphone size={14} /> },
    { id: 'bank',    label: 'Ngân hàng',icon: <Building2  size={14} /> },
  ];

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center px-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}>
      <div className="w-full max-w-sm rounded-2xl overflow-hidden"
        style={{ background: '#15121c', border: '1px solid rgba(201,169,110,0.2)' }}>

        {/* Header */}
        <div className="relative p-5 text-center"
          style={{ background: 'linear-gradient(135deg, rgba(201,169,110,0.1), rgba(212,117,107,0.07))' }}>
          <button onClick={onClose}
            className="absolute top-3 right-3 p-1.5 rounded-lg text-gray-600 hover:text-white hover:bg-white/10 transition-all">
            <X size={16} />
          </button>

          {/* Lock icon */}
          <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3"
            style={{ background: 'linear-gradient(135deg, #c9a96e22, #c9a96e11)', border: '1px solid rgba(201,169,110,0.3)' }}>
            <Lock size={24} style={{ color: '#c9a96e' }} />
          </div>

          <h2 className="font-bold text-white text-lg mb-1">Mở khoá bài hát</h2>
          <p className="text-gray-500 text-sm mb-3">Nghe đầy đủ không giới hạn</p>

          {/* Track info */}
          <div className="flex items-center gap-3 p-3 rounded-xl text-left"
            style={{ background: 'rgba(0,0,0,0.3)' }}>
            <div className="w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center font-bold"
              style={{ background: `${track.color}33`, color: track.color, border: `1px solid ${track.color}33` }}>
              {track.title?.[0] || '♪'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm text-gray-200 truncate">{track.title}</div>
              <div className="text-xs text-gray-600">{track.producer || 'BAT'}</div>
            </div>
            <div className="flex-shrink-0 text-right">
              <div className="font-black text-lg" style={{ color: '#c9a96e' }}>
                {PRICE.toLocaleString('vi-VN')}đ
              </div>
              <div className="text-xs text-gray-600">một lần</div>
            </div>
          </div>
        </div>

        {/* Payment tabs */}
        <div className="px-5 pt-4">
          <div className="flex gap-1 mb-4 p-1 rounded-xl" style={{ background: 'rgba(0,0,0,0.3)' }}>
            {tabs.map(t => (
              <button key={t.id} id={`pay-tab-${t.id}`}
                onClick={() => setTab(t.id)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all"
                style={tab === t.id
                  ? { background: 'rgba(201,169,110,0.15)', color: '#c9a96e', border: '1px solid rgba(201,169,110,0.25)' }
                  : { color: '#6b6480' }}>
                {t.icon} {t.label}
              </button>
            ))}
          </div>

          {/* MoMo */}
          {tab === 'momo' && (
            <div>
              <div className="w-36 h-36 mx-auto mb-3 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(168,0,100,0.1)', border: '1px solid rgba(168,0,100,0.2)' }}>
                {/* QR placeholder */}
                <div className="text-center">
                  <div className="text-4xl mb-1">📱</div>
                  <div className="text-xs text-gray-600">QR MoMo</div>
                  <div className="text-xs font-bold mt-1" style={{ color: '#a80064' }}>a80064</div>
                </div>
              </div>
              <InfoRow label="Số điện thoại" value={PAYMENT_INFO.momo.phone} />
              <InfoRow label="Tên"            value={PAYMENT_INFO.momo.name} />
              <InfoRow label="Nội dung"        value={`${PAYMENT_INFO.momo.note} - ${track.title}`} />
              <InfoRow label="Số tiền"         value={`${PRICE.toLocaleString('vi-VN')}đ`} />
            </div>
          )}

          {/* ZaloPay */}
          {tab === 'zalopay' && (
            <div>
              <div className="w-36 h-36 mx-auto mb-3 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(0,120,200,0.1)', border: '1px solid rgba(0,120,200,0.2)' }}>
                <div className="text-center">
                  <div className="text-4xl mb-1">💙</div>
                  <div className="text-xs text-gray-600">QR ZaloPay</div>
                </div>
              </div>
              <InfoRow label="Số điện thoại" value={PAYMENT_INFO.zalopay.phone} />
              <InfoRow label="Tên"            value={PAYMENT_INFO.zalopay.name} />
              <InfoRow label="Nội dung"        value={`${PAYMENT_INFO.zalopay.note} - ${track.title}`} />
              <InfoRow label="Số tiền"         value={`${PRICE.toLocaleString('vi-VN')}đ`} />
            </div>
          )}

          {/* Bank */}
          {tab === 'bank' && (
            <div>
              <div className="w-36 h-36 mx-auto mb-3 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(201,169,110,0.08)', border: '1px solid rgba(201,169,110,0.2)' }}>
                <div className="text-center">
                  <div className="text-4xl mb-1">🏦</div>
                  <div className="text-xs" style={{ color: '#c9a96e' }}>{PAYMENT_INFO.bank.bankName}</div>
                </div>
              </div>
              <InfoRow label="Ngân hàng"  value={PAYMENT_INFO.bank.bankName} />
              <InfoRow label="Số TK"       value={PAYMENT_INFO.bank.accountNumber} />
              <InfoRow label="Chủ TK"      value={PAYMENT_INFO.bank.accountName} />
              <InfoRow label="Chi nhánh"   value={PAYMENT_INFO.bank.branch} />
              <InfoRow label="Nội dung"    value={`${PAYMENT_INFO.bank.note} ${track.title}`} />
              <InfoRow label="Số tiền"     value={`${PRICE.toLocaleString('vi-VN')}đ`} />
            </div>
          )}
        </div>

        {/* Confirm button */}
        <div className="p-5 pt-4">
          {confirmed ? (
            <div className="flex items-center justify-center gap-2 py-3 rounded-xl font-bold"
              style={{ background: 'rgba(122,184,160,0.15)', color: '#7ab8a0', border: '1px solid rgba(122,184,160,0.3)' }}>
              <CheckCircle size={18} /> Đang mở khoá...
            </div>
          ) : (
            <button id="confirm-payment-btn"
              onClick={handleConfirm}
              disabled={confirming}
              className="w-full py-3.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2"
              style={{
                background: 'linear-gradient(135deg, #c9a96e, #e8c98a)',
                color: '#08070a',
                opacity: confirming ? 0.7 : 1,
              }}>
              {confirming
                ? <><span className="animate-spin inline-block w-4 h-4 border-2 border-black/30 border-t-black rounded-full" /> Đang xác nhận...</>
                : '✅ Tôi đã chuyển tiền — Mở khoá ngay'
              }
            </button>
          )}

          <p className="text-center text-xs text-gray-700 mt-3">
            Sau khi thanh toán, bấm nút trên để mở khoá tức thì.
            <br/>Hỗ trợ: <span style={{ color: '#c9a96e' }}>bat@buiantu.com</span>
          </p>
        </div>
      </div>
    </div>
  );
}
