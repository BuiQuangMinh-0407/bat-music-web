// components/ui/Equalizer.jsx
// Animation 4 thanh nhảy lên xuống khi đang phát nhạc

export default function Equalizer({ color = '#c9a96e' }) {
  return (
    <div className="flex items-end gap-0.5 h-5">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="eq-bar" style={{ background: color }} />
      ))}
    </div>
  );
}
