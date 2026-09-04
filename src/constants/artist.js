// ─────────────────────────────────────────────────────────────────────────────
// constants/artist.js
// Chỉnh sửa tại đây: thông tin nghệ sĩ, mạng xã hội, credits
// ─────────────────────────────────────────────────────────────────────────────

export const ARTIST = {
  name:     'BAT',
  fullName: 'Bùi Anh Tú',
  tagline:  'Producer & Songwriter',
  email:    'bat@buiantu.com',
  bio: `BAT (Bùi Anh Tú) là một producer và songwriter người Việt Nam với phong cách
âm nhạc độc đáo pha trộn giữa R&B hiện đại và Lo-Fi mượt mà. Với nhiều năm kinh nghiệm
trong làng nhạc Việt, BAT đã tạo ra những giai điệu chạm đến cảm xúc người nghe — từ những
bản nhạc tối và đằm thắm đến những track chill nhẹ nhàng cuối ngày.`,

  stats: [
    { label: 'Beats đã bán',      value: '1.2K+' },
    { label: 'Nghệ sĩ hợp tác',  value: '80+'   },
    { label: 'Lượt nghe',         value: '5M+'   },
    { label: 'Năm kinh nghiệm',   value: '7+'    },
  ],

  skills: [
    { label: 'R&B / Neo-Soul', pct: 92 },
    { label: 'Lo-Fi / Jazz',   pct: 88 },
    { label: 'Songwriting',    pct: 78 },
    { label: 'Mixing',         pct: 82 },
  ],

  socials: [
    { id: 'instagram',   label: 'Instagram',   url: '#', handle: '@bat.producer' },
    { id: 'youtube',     label: 'YouTube',     url: '#', handle: 'BAT Official'  },
    { id: 'soundcloud',  label: 'SoundCloud',  url: '#', handle: 'bat-music'     },
    { id: 'spotify',     label: 'Spotify',     url: '#', handle: 'BAT'           },
  ],

  platforms: ['Spotify', 'Apple Music', 'YouTube Music', 'SoundCloud', 'Zing MP3'],
};

export const COLLABS = [
  { id: 1, name: 'Vũ.',        role: 'Vocalist', tracks: 12, color: '#c9a96e' },
  { id: 2, name: 'Tlinh',      role: 'Rapper',   tracks: 8,  color: '#d4756b' },
  { id: 3, name: 'Obito',      role: 'Rapper',   tracks: 6,  color: '#7ab8a0' },
  { id: 4, name: 'Phương Ly',  role: 'Vocalist', tracks: 10, color: '#a78bca' },
  { id: 5, name: 'RPT MCK',    role: 'Rapper',   tracks: 4,  color: '#e8a09a' },
  { id: 6, name: 'HIEUTHUHAI', role: 'Rapper',   tracks: 5,  color: '#74b8d4' },
];

export const NAV_LINKS = [
  { label: 'Home',    href: '#home'    },
  { label: 'Beats',   href: '#beats'   },
  { label: 'About',   href: '#about'   },
  { label: 'Credits', href: '#credits' },
  { label: 'Contact', href: '#contact' },
];
