// components/ui/ArtworkPlaceholder.jsx
// Ảnh bìa đẹp + gradient động nếu không có imageUrl (tự động resolve /uploads URL)
import { getMediaUrl } from '@/constants/api';

const SIZES = {
  xs: { w: 32,  h: 32,  r: 6,  fontSize: 10 },
  sm: { w: 44,  h: 44,  r: 10, fontSize: 13 },
  md: { w: 52,  h: 52,  r: 12, fontSize: 16 },
  lg: { w: 80,  h: 80,  r: 16, fontSize: 24 },
  xl: { w: 120, h: 120, r: 20, fontSize: 36 },
};

/* Gradient đẹp dựa vào màu accent của track */
function artGradient(color) {
  return `linear-gradient(135deg, ${color}ee 0%, ${color}99 40%, ${color}44 100%)`;
}

/* Lấy ký tự đầu hoặc emoji note */
function initials(title = '') {
  return title.trim().charAt(0).toUpperCase() || '♪';
}

export default function ArtworkPlaceholder({
  color = '#c9a96e',
  size  = 'sm',
  title = '',
  imageUrl,
  className = '',
  style = {},
}) {
  const s = SIZES[size] ?? SIZES.sm;

  const containerStyle = {
    width:        s.w,
    height:       s.h,
    borderRadius: s.r,
    flexShrink:   0,
    overflow:     'hidden',
    position:     'relative',
    ...style,
  };

  if (imageUrl) {
    const resolvedUrl = getMediaUrl(imageUrl);

    return (
      <div style={containerStyle} className={className}>
        <img
          src={resolvedUrl}
          alt={title}
          loading="lazy"
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.parentElement.style.background = artGradient(color);
          }}
        />
      </div>
    );
  }

  // Placeholder với gradient + letter + decorative circle
  return (
    <div
      style={{
        ...containerStyle,
        background: artGradient(color),
        border: `1px solid ${color}44`,
        boxShadow: `0 0 16px ${color}22, inset 0 1px 0 rgba(255,255,255,0.12)`,
      }}
      className={className}>

      {/* Decorative circle */}
      <div style={{
        position: 'absolute',
        bottom: -s.w * 0.2,
        right:  -s.w * 0.2,
        width:   s.w * 0.7,
        height:  s.w * 0.7,
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.07)',
      }} />

      {/* Letter */}
      <div style={{
        position:   'absolute',
        inset:       0,
        display:    'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize:   s.fontSize,
        fontWeight: 800,
        color:      'rgba(255,255,255,0.9)',
        fontFamily: 'Righteous, sans-serif',
        textShadow: `0 2px 8px rgba(0,0,0,0.4)`,
        letterSpacing: '0.05em',
      }}>
        {initials(title)}
      </div>
    </div>
  );
}
