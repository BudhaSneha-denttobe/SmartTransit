/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.js', './src/**/*.ts', './src/**/*.jsx', './src/**/*.tsx'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#e0f7ff',
          100: '#b3ecff',
          200: '#80e0ff',
          300: '#4dd4ff',
          400: '#26c8ff',
          500: '#00bfff',
          600: '#00a3d4',
          700: '#0087aa',
          800: '#006b80',
          900: '#004f55',
        },
        dark: {
          50: '#f0f0f0',
          100: '#d1d1d1',
          200: '#b3b3b3',
          300: '#808080',
          400: '#4d4d4d',
          500: '#1a1a2e',
          600: '#16213e',
          700: '#0f3460',
          800: '#0a0a1a',
          900: '#050510',
        },
      },
    },
  },
  plugins: [],
};
