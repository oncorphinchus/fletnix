/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './app/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#e50914',
          dark: '#b81d24',
          light: '#f5222d',
        },
        secondary: {
          DEFAULT: '#221f1f',
          light: '#2c2c2c',
          dark: '#141414',
        },
        background: {
          DEFAULT: '#141414',
          light: '#181818',
          dark: '#0f0f0f',
          card: '#252525',
        },
        text: {
          DEFAULT: '#ffffff',
          secondary: '#b3b3b3',
          muted: '#757575',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Helvetica', 'Arial', 'sans-serif'],
      },
      spacing: {
        'header': '60px',
      },
      screens: {
        'xs': '450px',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        },
      },
    },
  },
  plugins: [],
  darkMode: 'class',
} 