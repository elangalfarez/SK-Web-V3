/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#121421',
        'royal-purple': '#5A2E8A',
        'dark-purple': '#4A256F',
        secondary: '#D4AF37',
        gold: '#D4AF37',
        accent: '#1F2937',
        'dark-gray': '#1F2937',
        'light-gray': '#CCCCCC',
        'chinese-black': '#121421',
        'charcoal': '#333333',
        'gunmetal': '#2A3439',
        'white-600': '#F3F4F6',
        'white-700': '#E5E7EB',
        'onyx-gray': '#2A2F3A',
        'black-600': '#1F2937',
      },
      fontFamily: {
        sans: ['Figtree', 'sans-serif'],
      },
      flex: {
        '2': '2 2 0%',
      },
      screens: {
        '3xl': '1600px',
      },
    },
  },
  plugins: [],
};