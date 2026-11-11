/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: { ink: '#0B0B0C', coal: '#161618', gold: '#D4AF37', gold2: '#F3E5AB', maroon: '#6D0F1F', maroon2: '#8C1B2E', cream: '#FAF3E3', mute: '#b9ad94' },
      fontFamily: {
        display: ['Cinzel', 'Noto Sans Devanagari', 'Noto Sans Kannada', 'Noto Sans Malayalam', 'Noto Sans Tamil', 'Noto Sans Telugu', 'Georgia', 'serif'],
        body: ['Cormorant Garamond', 'Noto Sans Devanagari', 'Noto Sans Kannada', 'Noto Sans Malayalam', 'Noto Sans Tamil', 'Noto Sans Telugu', 'Georgia', 'serif'],
      },
      keyframes: {
        zin: { from: { opacity: 0, transform: 'scale(.7)' }, to: { opacity: 1, transform: 'none' } },
        marquee: { to: { transform: 'translateX(-50%)' } },
      },
      animation: { zin: 'zin 2.2s cubic-bezier(.2,.7,.2,1) both', marquee: 'marquee 48s linear infinite', 'marquee-rev': 'marquee 58s linear infinite reverse' },
    },
  },
  plugins: [],
}
