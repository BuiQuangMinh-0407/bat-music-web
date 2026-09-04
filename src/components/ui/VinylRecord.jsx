// components/ui/VinylRecord.jsx
// Đĩa vinyl quay + animation float

export default function VinylRecord({ color = '#c9a96e', size = 200 }) {
  return (
    <div
      className="vinyl flex-shrink-0 relative"
      style={{
        width:     size,
        height:    size,
        animation: 'float 6s ease-in-out infinite',
      }}>
      {/* Label ở giữa đĩa */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center font-black text-xs tracking-widest"
          style={{
            background: `linear-gradient(135deg, ${color}44, ${color}22)`,
            border:     `2px solid ${color}55`,
            color,
          }}>
          BAT
        </div>
      </div>

      {/* Glow */}
      <div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          boxShadow:    `0 0 80px ${color}18`,
          borderRadius: '50%',
        }}
      />
    </div>
  );
}
