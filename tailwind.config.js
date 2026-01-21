/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#FF6B9D', // Pink
          light: '#FFB4D0',
          dark: '#E5527D',
        },
        secondary: {
          DEFAULT: '#FFC837', // Yellow
          light: '#FFE4A0',
          dark: '#E5B020',
        },
        accent: {
          pink: '#FF8FAB',
          peach: '#FFCBA4',
          rose: '#FFD1DC',
        },
        // Soft multi-color palette for Leadership style
        soft: {
          blue: { DEFAULT: '#4F8FFF', light: '#7CB3FF', bg: '#EBF3FF' },
          orange: { DEFAULT: '#FF8F6B', light: '#FFB088', bg: '#FFF3EE' },
          green: { DEFAULT: '#4ECB71', light: '#7EDA99', bg: '#EDFBF2' },
          cyan: { DEFAULT: '#6BCFCF', light: '#9DE5E5', bg: '#EDFAFA' },
          purple: { DEFAULT: '#8B7FD4', light: '#B8B0E8', bg: '#F3F1FB' },
        },
        success: '#22C55E',
        warning: '#F59E0B',
        error: '#EF4444',
        background: '#FFF9FB',
        card: '#FFFBFC',
        text: '#2D1B2E',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #FF6B9D 0%, #FFC837 100%)',
        'gradient-soft': 'linear-gradient(135deg, #FFE4F0 0%, #FFF9E5 100%)',
        'gradient-warm': 'linear-gradient(135deg, #FFF5F8 0%, #FFFBF0 50%, #FFF5F8 100%)',
        'gradient-glow': 'linear-gradient(135deg, rgba(255,107,157,0.1) 0%, rgba(255,200,55,0.1) 100%)',
        // Soft gradients for value cards
        'gradient-blue': 'linear-gradient(135deg, #4F8FFF 0%, #7CB3FF 100%)',
        'gradient-orange': 'linear-gradient(135deg, #FF8F6B 0%, #FFB088 100%)',
        'gradient-green': 'linear-gradient(135deg, #4ECB71 0%, #7EDA99 100%)',
        'gradient-cyan': 'linear-gradient(135deg, #6BCFCF 0%, #9DE5E5 100%)',
        'gradient-purple': 'linear-gradient(135deg, #8B7FD4 0%, #B8B0E8 100%)',
      },
      boxShadow: {
        'glow-pink': '0 0 20px rgba(255, 107, 157, 0.3)',
        'glow-yellow': '0 0 20px rgba(255, 200, 55, 0.3)',
        'glow': '0 0 30px rgba(255, 107, 157, 0.2), 0 0 60px rgba(255, 200, 55, 0.2)',
        // Soft color shadows
        'glow-blue': '0 8px 30px rgba(79, 143, 255, 0.25)',
        'glow-orange': '0 8px 30px rgba(255, 143, 107, 0.25)',
        'glow-green': '0 8px 30px rgba(78, 203, 113, 0.25)',
        'glow-cyan': '0 8px 30px rgba(107, 207, 207, 0.25)',
        'glow-purple': '0 8px 30px rgba(139, 127, 212, 0.25)',
        // Card shadows
        'card-soft': '0 4px 20px rgba(0, 0, 0, 0.04)',
        'card-hover': '0 12px 40px rgba(0, 0, 0, 0.08)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
