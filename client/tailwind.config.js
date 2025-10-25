/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: '#e5e7eb',
        coins: {
          blue: '#0610ac',
          'blue-soft': 'rgba(6, 16, 172, 0.12)',
          'blue-strong': 'rgba(6, 16, 172, 0.32)',
          'bg-light': '#f6f8fa',
          'bg-dark': '#0d0d12',
          'text-dark': '#0d0d12',
          'text-light': '#f8fafc',
          'border-light': '#dfe1e7',
          'border-transparent': 'rgba(132, 133, 140, 0.5)',
        },
        primary: {
          50: '#eef1ff',
          100: '#d8ddff',
          200: '#b6c1ff',
          300: '#8d9bff',
          400: '#5a6df7',
          500: '#0610ac',
          600: '#050d8a',
          700: '#040b6d',
          800: '#030856',
          900: '#020645',
          950: '#01032a',
        },
        glass: {
          light: 'rgba(255, 255, 255, 0.08)',
          medium: 'rgba(255, 255, 255, 0.14)',
          heavy: 'rgba(255, 255, 255, 0.22)',
        },
        royal: {
          light: '#fafbfc',
          dark: '#0d0d12',
          accent: 'linear-gradient(135deg, rgba(6, 16, 172, 0.05) 0%, rgba(6, 16, 172, 0.02) 100%)',
        },
      },
      backgroundImage: {
        'coins-light': '#ffffff',
        'coins-dark': '#0d0d12',
        'royal-accent': 'linear-gradient(135deg, rgba(6, 16, 172, 0.05) 0%, rgba(6, 16, 172, 0.02) 100%)',
      },
      boxShadow: {
        coins: '0 1px 3px rgba(0, 0, 0, 0.06)',
        'coins-sm': '0 1px 2px rgba(0, 0, 0, 0.04)',
        'coins-md': '0 2px 4px rgba(0, 0, 0, 0.08)',
        'royal': '0 4px 6px -1px rgba(6, 16, 172, 0.1), 0 2px 4px -1px rgba(6, 16, 172, 0.06)',
        'royal-soft': '0 2px 4px -1px rgba(6, 16, 172, 0.08), 0 1px 2px -1px rgba(6, 16, 172, 0.04)',
        'royal-strong': '0 10px 15px -3px rgba(6, 16, 172, 0.15), 0 4px 6px -2px rgba(6, 16, 172, 0.1)',
        'royal-inner': 'inset 0 2px 4px 0 rgba(6, 16, 172, 0.06)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-in': 'slideIn 0.4s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'float': 'float 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(0, 0, 205, 0.6), 0 0 10px rgba(0, 0, 205, 0.4)' },
          '100%': { boxShadow: '0 0 20px rgba(0, 0, 205, 0.9), 0 0 30px rgba(0, 0, 205, 0.6)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}