/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#0d1b2a',
          light: '#16263a',
          lighter: '#1e3451',
        },
        gold: {
          DEFAULT: '#c9a96e',
          light: '#dfc08a',
          dark: '#a8873f',
        },
        cream: {
          DEFAULT: '#f8f4ef',
          dark: '#e8e0d5',
        },
      },
      fontFamily: {
        display: ['Playfair Display', 'Georgia', 'serif'],
        body: ['DM Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
