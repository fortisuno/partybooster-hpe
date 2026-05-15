/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
    '../../packages/shared/src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        gryffindor: {
          DEFAULT: '#7A1C1C',
          gold: '#D4A843',
          accent: '#D4A843',
        },
        slytherin: {
          DEFAULT: '#1A472A',
          silver: '#C0C0C0',
          accent: '#C0C0C0',
        },
        ravenclaw: {
          DEFAULT: '#1A2B5E',
          bronze: '#946B2D',
          accent: '#946B2D',
        },
        hufflepuff: {
          DEFAULT: '#D4A843',
          dark: '#372E29',
          accent: '#D4A843',
        },
      },
      fontFamily: {
        display: ['Cinzel', 'Georgia', 'serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      maxWidth: {
        mobile: '430px',
      },
      keyframes: {
        'glow-pulse': {
          '0%, 100%': {
            boxShadow: '0 0 15px rgba(212,168,67,0.15), 0 0 30px rgba(212,168,67,0.05)',
          },
          '50%': {
            boxShadow: '0 0 25px rgba(212,168,67,0.35), 0 0 50px rgba(212,168,67,0.1)',
          },
        },
        'card-enter': {
          '0%': {
            opacity: '0',
            transform: 'scale(0.85) translateY(30px)',
          },
          '100%': {
            opacity: '1',
            transform: 'scale(1) translateY(0)',
          },
        },
        'draw-btn-enter': {
          '0%': {
            opacity: '0',
            transform: 'translateY(40px) scale(0.9)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0) scale(1)',
          },
        },
        'screen-in': {
          '0%': {
            opacity: '0',
            transform: 'translateY(12px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        'house-aura': {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
      },
      animation: {
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'card-enter': 'card-enter 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'draw-btn-enter': 'draw-btn-enter 0.4s cubic-bezier(0.16, 1, 0.3, 1) 0.2s both',
        'screen-in': 'screen-in 0.35s cubic-bezier(0.16, 1, 0.3, 1) both',
        'house-aura': 'house-aura 3s ease-in-out infinite',
        shimmer: 'shimmer 1.5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};