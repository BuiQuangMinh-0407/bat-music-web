/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary brand palette
        brand:         '#c9a96e',
        'brand-light': '#e8c98a',
        'brand-dark':  '#8a6b3a',
        gold:          '#c9a96e',

        // Accent palette — multi-color artistic
        accent:  '#d4756b',   // rose
        violet:  '#a78bca',
        teal:    '#7ab8a0',
        sky:     '#74b8d4',
        pink:    '#e88fa0',

        // Dark surface scale
        surface: {
          950: '#07060d',
          900: '#0e0c14',
          850: '#110f1a',
          800: '#19162399',
          700: '#1c1826',
          600: '#24202f',
          500: '#2e2940',
          400: '#3a3450',
          300: '#4d4668',
        },
      },
      fontFamily: {
        // UI/UX Pro Max: Poppins (body) + Righteous (heading)
        sans:       ['Poppins', 'system-ui', 'sans-serif'],
        display:    ['Righteous', '"DM Serif Display"', 'Georgia', 'serif'],
        // Đoạn mô tả nghệ thuật — chữ thường đọc dễ, có cảm xúc
        lora:       ['Lora', 'Georgia', 'serif'],
        // Heading section kiểu hiện đại geometric
        grotesk:    ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        // Contact heading sang trọng
        cormorant:  ['"Cormorant Garamond"', 'Georgia', 'serif'],
      },
      backgroundImage: {
        'gold-gradient':  'linear-gradient(135deg, #c9a96e 0%, #e8c98a 50%, #c9a96e 100%)',
        'multi-gradient': 'linear-gradient(135deg, #c9a96e 0%, #e88fa0 33%, #a78bca 66%, #7ab8a0 100%)',
        'hero-gradient':  'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(201,169,110,0.12) 0%, transparent 70%)',
        'card-shine':     'linear-gradient(135deg, rgba(201,169,110,0.06) 0%, rgba(167,139,202,0.04) 100%)',
      },
      boxShadow: {
        'gold':       '0 0 24px rgba(201,169,110,0.35)',
        'gold-sm':    '0 0 12px rgba(201,169,110,0.2)',
        'gold-lg':    '0 0 48px rgba(201,169,110,0.4)',
        'violet':     '0 0 24px rgba(167,139,202,0.35)',
        'rose':       '0 0 24px rgba(212,117,107,0.35)',
      },
      animation: {
        'float':       'float 6s ease-in-out infinite',
        'fade-up':     'fadeUp 0.6s ease forwards',
        'shimmer':     'shimmer 5s linear infinite',
        'spin-slow':   'spin 12s linear infinite',
        'pulse-glow':  'pulse-glow 2s ease-in-out infinite',
        'marquee':     'marquee 28s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%':      { transform: 'translateY(-14px) rotate(1.5deg)' },
        },
        fadeUp: {
          from: { opacity: 0, transform: 'translateY(24px)' },
          to:   { opacity: 1, transform: 'translateY(0)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '0% center' },
          '100%': { backgroundPosition: '280% center' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 16px rgba(201,169,110,0.3)' },
          '50%':      { boxShadow: '0 0 40px rgba(201,169,110,0.7), 0 0 70px rgba(201,169,110,0.2)' },
        },
        marquee: {
          from: { transform: 'translateX(0)' },
          to:   { transform: 'translateX(-50%)' },
        },
      },
    },
  },
  plugins: [],
}
