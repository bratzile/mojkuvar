/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#8B4513', // Saddle brown - warm wood color
        secondary: '#A0522D', // Sienna - slightly lighter wood color
        background: '#FFFFFF',
        surface: '#F3F4F6',
        accent: '#FAF0E6', // Linen - warm light color
      },
      fontFamily: {
        sans: ['Montserrat', 'sans-serif'],
        handwriting: ['Caveat', 'cursive'],
      },
    },
  },
  plugins: [],
};