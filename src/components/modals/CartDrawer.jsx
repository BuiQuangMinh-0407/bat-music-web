// components/modals/CartDrawer.jsx
// Ngăn kéo giỏ hàng phía phải màn hình
import { ShoppingCart, X } from 'lucide-react';
import ArtworkPlaceholder from '@/components/ui/ArtworkPlaceholder';

export default function CartDrawer({ items = [], onClose, onRemove, onCheckout }) {
  const total = items.reduce((sum, item) => sum + item.price, 0);

  return (
    <div className="fixed inset-0 z-[60] flex">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className="relative ml-auto w-full max-w-sm h-full glass flex flex-col"
        style={{ borderLeft: '1px solid rgba(201,169,110,0.12)' }}>

        {/* Header */}
        <div
          className="flex items-center justify-between p-5"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <h2 className="font-bold text-gray-100 flex items-center gap-2">
            <ShoppingCart size={17} style={{ color: '#c9a96e' }} />
            Giỏ hàng ({items.length})
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-600 hover:text-white hover:bg-white/5 transition-all">
            <X size={17} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-gray-700">
              <ShoppingCart size={44} className="opacity-20" />
              <p className="text-sm">Giỏ hàng trống</p>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.cartId}
                className="flex items-center gap-3 p-3 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <ArtworkPlaceholder color={item.color} size="sm" title={item.title} imageUrl={item.imageUrl} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-gray-200 truncate">{item.title}</div>
                  <div className="text-xs text-gray-600">{item.producer ?? 'BAT'}</div>
                  <div className="text-xs font-bold mt-0.5" style={{ color: '#c9a96e' }}>${item.price.toFixed(2)}</div>
                </div>
                <button
                  onClick={() => onRemove(item.cartId)}
                  className="p-1 text-gray-700 hover:text-red-400 transition-colors">
                  <X size={14} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Checkout */}
        {items.length > 0 && (
          <div className="p-4 space-y-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tổng cộng</span>
              <span className="font-bold" style={{ color: '#c9a96e' }}>${total.toFixed(2)}</span>
            </div>
            <button
              id="checkout-btn"
              onClick={() => onCheckout(items)}
              className="btn-gold w-full py-3.5 text-center">
              Thanh toán — ${total.toFixed(2)}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
