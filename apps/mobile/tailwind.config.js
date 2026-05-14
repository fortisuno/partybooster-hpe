/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
    '../../packages/shared/src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        gryffindor: '#740001',
        'gryffindor-light': '#ac7a00',
        hufflepuff: '#ECB939',
        'hufflepuff-dark': '#b59425',
        ravenclaw: '#0E1A40',
        'ravenclaw-light': '#2a3b6b',
        slytherin: '#1A472A',
        'slytherin-light': '#2d6b42',
      },
    },
  },
  plugins: [],
};