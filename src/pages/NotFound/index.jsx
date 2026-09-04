// pages/NotFound/index.jsx
// Trang lỗi 404 nghệ thuật — đồng bộ style Retro-Futurism & Dark Mode OLED
import { useNavigate } from 'react-router-dom';
import { Home, Compass, MoveLeft } from 'lucide-react';
import VinylRecord from '@/components/ui/VinylRecord';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden"
      style={{ background: '#07060d' }}>

      {/* Decorative Orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="orb orb-violet w-[350px] h-[350px] top-1/4 -left-20 opacity-30" />
        <div className="orb orb-rose w-[300px] h-[300px] bottom-1/4 -right-20 opacity-20" />
      </div>

      <div className="text-center relative z-10 space-y-6 max-w-md">
        {/* Floating Vinyl */}
        <div className="flex justify-center animate-float">
          <VinylRecord isPlaying={true} color="#a78bca" size="xl" />
        </div>

        <div>
          {/* Shimmering 404 Title */}
          <h1
            className="font-display text-8xl font-black text-gold-shimmer animate-shimmer"
            style={{
              background: 'linear-gradient(90deg, #c9a96e, #e88fa0, #a78bca, #7ab8a0, #c9a96e)',
              backgroundSize: '200% auto',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              letterSpacing: '-0.05em'
            }}>
            404
          </h1>
          <p className="font-grotesk text-xl font-bold text-gray-200 mt-2">
            Giai điệu này chưa được viết ra...
          </p>
          <p className="text-sm text-gray-600 mt-1 max-w-xs mx-auto">
            Trang bạn đang tìm kiếm không tồn tại hoặc đã được di chuyển sang một đường dẫn khác.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-xs font-semibold text-gray-400 hover:text-white transition-colors"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <MoveLeft size={14} /> Quay lại
          </button>

          <button
            onClick={() => navigate('/')}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl text-xs font-bold text-black transition-all hover:scale-105 active:scale-95"
            style={{
              background: 'linear-gradient(135deg, #c9a96e, #e8c98a)',
              boxShadow: '0 8px 24px rgba(201,169,110,0.25)'
            }}>
            <Home size={14} /> Về trang chủ
          </button>
        </div>
      </div>
    </div>
  );
}
