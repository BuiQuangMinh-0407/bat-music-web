// components/modals/PaywallModal.jsx
// Popup thanh toán mở khoá bài hát — Hỗ trợ cả Webhook SePay tự động & Xác nhận thủ công
import { useState, useEffect, useRef } from 'react';
import { X, Lock, CheckCircle, Copy, Check, Smartphone, Building2, RefreshCw } from 'lucide-react';
import { PAYMENT_INFO, UNLOCK_PRICE_VND } from '@/constants/payment';
import { useAuth } from '@/contexts/AuthContext';
import { API } from '@/constants/api';

// ── Copy Button ───────────────────────────────────────────────────────────────
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
      style={{ color: copied ? '#7ab8a0' : '#6b6480', background: copied ? 'rgba(122,184,160,0.1)' : 'transparent' }}>
      {copied ? <Check size={13} /> : <Copy size={13} />}
    </button>
  );
}

// ── Info Row ──────────────────────────────────────────────────────────────────
function InfoRow({ label, value }) {
  return (
    <div
      className="flex items-center justify-between py-2"
      style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
      <span className="text-xs text-gray-600">{label}</span>
      <div className="flex items-center gap-1.5">
        <span className="text-sm font-semibold text-gray-200">{value}</span>
        <CopyButton text={value} />
      </div>
    </div>
  );
}

const TABS = [
  { id: 'bank',    label: 'Ngân hàng', icon: <Building2  size={14} /> },
  { id: 'momo',    label: 'MoMo',      icon: <Smartphone size={14} /> },
  { id: 'zalopay', label: 'ZaloPay',   icon: <Smartphone size={14} /> },
];

export default function PaywallModal({ track, tracks = [], onClose, onUnlock }) {
  const [tab, setTab] = useState('bank');

  // Danh sách tracks cần unlock
  const isMulti = tracks.length > 0;
  const targetTracks = isMulti ? tracks : (track ? [track] : []);

  const { token } = useAuth();
  const [orderCode, setOrderCode] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState('pending'); // 'pending' | 'paid'
  const [confirming, setConfirming] = useState(false);

  // Tổng tiền
  const totalCost = UNLOCK_PRICE_VND * (targetTracks.length || 1);
  const priceFormatted = totalCost.toLocaleString('vi-VN');

  // Hàm tạo đơn hàng
  const initOrder = async () => {
    if (targetTracks.length === 0) return;
    const trackIds = targetTracks.map((t) => t.id ?? t._id);

    try {
      const res = await fetch(`${API}/payment/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ trackIds, amount: totalCost })
      });
      const data = await res.json();
      if (data.success && data.orderCode) {
        setOrderCode(data.orderCode);
      } else {
        // Dự phòng mã đơn nếu server chưa có token
        const randomCode = 'BAT-' + Math.random().toString(36).substring(2, 8).toUpperCase();
        setOrderCode(randomCode);
      }
    } catch (err) {
      const randomCode = 'BAT-' + Math.random().toString(36).substring(2, 8).toUpperCase();
      setOrderCode(randomCode);
    }
  };

  useEffect(() => {
    initOrder();
  }, [token]);

  // Tự động Polling kiểm tra trạng thái thanh toán từ SePay webhook
  useEffect(() => {
    if (!orderCode || paymentStatus === 'paid') return;
    let isMounted = true;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${API}/payment/check/${orderCode}`);
        const data = await res.json();
        if (data.success && data.status === 'paid' && isMounted) {
          setPaymentStatus('paid');
          clearInterval(interval);
          setTimeout(() => {
            targetTracks.forEach((t) => onUnlock(t.id ?? t._id));
            onClose();
          }, 1200);
        }
      } catch (err) {
        // bỏ qua lỗi polling
      }
    }, 3000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [orderCode, paymentStatus, targetTracks, onUnlock, onClose]);

  // Xử lý xác nhận mở khóa thủ công (khi khách đã chuyển khoản)
  const handleManualConfirm = () => {
    setConfirming(true);
    setTimeout(() => {
      setPaymentStatus('paid');
      setConfirming(false);
      setTimeout(() => {
        targetTracks.forEach((t) => onUnlock(t.id ?? t._id));
        onClose();
      }, 1000);
    }, 1200);
  };

  if (targetTracks.length === 0) return null;

  const paymentNoteContent = orderCode || 'BAT-PREVIEW';
  const primaryColor = isMulti ? '#a78bca' : (targetTracks[0].color || '#c9a96e');

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center px-4"
      style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}>
      <div
        className="w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl"
        style={{ background: '#13111a', border: `1px solid ${primaryColor}44` }}>

        {/* Header */}
        <div
          className="relative p-5 text-center"
          style={{ background: `linear-gradient(135deg, ${primaryColor}20, rgba(212,117,107,0.05))` }}>
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all">
            <X size={16} />
          </button>

          <div
            className="w-13 h-13 rounded-full flex items-center justify-center mx-auto mb-2"
            style={{ background: `${primaryColor}20`, border: `1px solid ${primaryColor}44`, width: 52, height: 52 }}>
            <Lock size={22} style={{ color: primaryColor }} />
          </div>
          <h2 className="font-bold text-white text-lg mb-0.5">
            {isMulti ? `Thanh toán giỏ hàng (${targetTracks.length})` : 'Mở khoá bài hát'}
          </h2>
          <p className="text-gray-400 text-xs mb-3">
            {isMulti ? 'Mở khóa vĩnh viễn tất cả beats đã chọn' : 'Nghe và tải về không giới hạn vĩnh viễn'}
          </p>

          {/* Danh sách tracks */}
          <div
            className="p-3 rounded-2xl text-left space-y-1.5 max-h-[120px] overflow-y-auto"
            style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.05)' }}>
            {targetTracks.map((t) => (
              <div key={t.id ?? t._id} className="flex items-center justify-between text-xs">
                <span className="text-gray-200 font-medium truncate max-w-[180px]">{t.title}</span>
                <span className="text-gray-500 text-[11px]">{t.producer ?? 'BAT'}</span>
              </div>
            ))}
            <div className="h-px bg-white/5 my-1" />
            <div className="flex justify-between items-center pt-0.5">
              <span className="text-xs font-semibold text-gray-400">Tổng thanh toán</span>
              <span className="font-black text-base" style={{ color: '#c9a96e' }}>{priceFormatted}đ</span>
            </div>
          </div>
        </div>

        {/* Payment tabs */}
        <div className="px-5 pt-3">
          <div className="flex gap-1 mb-3 p-1 rounded-xl" style={{ background: 'rgba(0,0,0,0.4)' }}>
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all"
                style={
                  tab === t.id
                    ? { background: `${primaryColor}22`, color: primaryColor, border: `1px solid ${primaryColor}44` }
                    : { color: '#6b6480' }
                }>
                {t.icon} {t.label}
              </button>
            ))}
          </div>

          {/* Ngân hàng MB Bank (VietQR) */}
          {tab === 'bank' && (
            <div>
              <div className="w-44 h-44 mx-auto mb-2 rounded-2xl p-2 bg-white flex items-center justify-center overflow-hidden shadow-lg border border-gold/30">
                <img
                  src={`https://img.vietqr.io/image/${PAYMENT_INFO.bank.bankId || 'MB'}-${PAYMENT_INFO.bank.accountNumber}-compact2.png?amount=${totalCost}&addInfo=${encodeURIComponent(paymentNoteContent)}&accountName=${encodeURIComponent(PAYMENT_INFO.bank.accountName)}`}
                  alt="VietQR Chuyển Khoản"
                  className="w-full h-full object-contain"
                />
              </div>
              <p className="text-[11px] text-center text-amber-300 font-medium mb-2">
                Quét mã bằng App Ngân Hàng để tự điền tiền &amp; nội dung
              </p>
              <InfoRow label="Ngân hàng"  value={PAYMENT_INFO.bank.bankName} />
              <InfoRow label="Số TK"      value={PAYMENT_INFO.bank.accountNumber} />
              <InfoRow label="Chủ TK"     value={PAYMENT_INFO.bank.accountName} />
              <InfoRow label="Nội dung"   value={paymentNoteContent} />
              <InfoRow label="Số tiền"    value={`${priceFormatted}đ`} />
            </div>
          )}

          {/* MoMo */}
          {tab === 'momo' && (
            <div>
              <div className="w-36 h-36 mx-auto mb-2 rounded-2xl flex items-center justify-center"
                style={{ background: 'rgba(168,0,100,0.1)', border: '1px solid rgba(168,0,100,0.2)' }}>
                <div className="text-center">
                  <div className="text-4xl mb-1">📱</div>
                  <div className="text-[11px] text-[#e0409a] font-bold">Chuyển MoMo</div>
                </div>
              </div>
              <InfoRow label="Số điện thoại" value={PAYMENT_INFO.momo.phone} />
              <InfoRow label="Tên MoMo"      value={PAYMENT_INFO.momo.name} />
              <InfoRow label="Nội dung"      value={paymentNoteContent} />
              <InfoRow label="Số tiền"       value={`${priceFormatted}đ`} />
            </div>
          )}

          {/* ZaloPay */}
          {tab === 'zalopay' && (
            <div>
              <div className="w-36 h-36 mx-auto mb-2 rounded-2xl flex items-center justify-center"
                style={{ background: 'rgba(0,120,200,0.1)', border: '1px solid rgba(0,120,200,0.2)' }}>
                <div className="text-center">
                  <div className="text-4xl mb-1">💙</div>
                  <div className="text-[11px] text-blue-400 font-bold">Chuyển ZaloPay</div>
                </div>
              </div>
              <InfoRow label="Số điện thoại" value={PAYMENT_INFO.zalopay.phone} />
              <InfoRow label="Tên ZaloPay"   value={PAYMENT_INFO.zalopay.name} />
              <InfoRow label="Nội dung"      value={paymentNoteContent} />
              <InfoRow label="Số tiền"       value={`${priceFormatted}đ`} />
            </div>
          )}
        </div>

        {/* Trạng thái xác nhận */}
        <div className="p-5 pt-3">
          {paymentStatus === 'paid' ? (
            <div
              className="flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm"
              style={{ background: 'rgba(122,184,160,0.18)', color: '#7ab8a0', border: '1px solid rgba(122,184,160,0.4)' }}>
              <CheckCircle size={18} /> Đã thanh toán! Đang mở khoá...
            </div>
          ) : (
            <div className="space-y-2.5">
              {/* Trạng thái đang chờ thanh toán */}
              <div
                className="w-full py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2"
                style={{
                  background: 'rgba(201,169,110,0.08)',
                  color: '#c9a96e',
                  border: '1px solid rgba(201,169,110,0.2)',
                }}>
                <span className="animate-spin inline-block w-4 h-4 border-2 border-amber-500/30 border-t-amber-400 rounded-full" />
                Đang chờ xác nhận chuyển khoản...
              </div>

              {/* Giải thích */}
              <div className="text-center space-y-1">
                <div className="flex items-center justify-center gap-2 text-[11px] text-emerald-400">
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Hệ thống tự động phát hiện khi bạn chuyển khoản
                </div>
                <p className="text-[10px] text-gray-500 leading-relaxed">
                  Sau khi quét mã QR và chuyển tiền xong, bài hát sẽ được mở khoá <strong className="text-gray-400">tự động trong vài giây</strong> mà không cần bấm thêm gì
                </p>
              </div>
            </div>
          )}

          <p className="text-center text-[11px] text-gray-600 mt-3">
            Hỗ trợ Zalo: <span style={{ color: '#c9a96e' }}>0389445060</span>
          </p>
        </div>
      </div>
    </div>
  );
}

