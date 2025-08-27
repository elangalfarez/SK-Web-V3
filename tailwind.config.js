// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // NEW: White-Purple Theme
        primary: '#FFFFFF',           // Changed from dark to white
        'primary-text': '#1F2937',    // NEW: Dark text for white backgrounds
        'royal-purple': '#5A2E8A',    // Keep existing purple
        'dark-purple': '#4A256F',     // Keep existing purple
        'light-purple': '#8B5FBF',    // NEW: Lighter purple for variety
        'purple-50': '#F3F0FF',       // NEW: Very light purple backgrounds
        'purple-100': '#E5DEFF',      // NEW: Light purple backgrounds
        
        // Remove/Replace Gold
        secondary: '#5A2E8A',         // Changed from gold to purple
        gold: '#5A2E8A',             // Replace gold with purple
        
        // Keep other colors
        accent: '#F8FAFC',           // Changed to very light gray
        'dark-gray': '#1F2937',
        'light-gray': '#CCCCCC',
        'chinese-black': '#1F2937',   // Keep for text
        'charcoal': '#374151',        // Lighter for better contrast
        'gunmetal': '#6B7280',        // Lighter for better contrast
        'white-600': '#F9FAFB',
        'white-700': '#F3F4F6',
        'onyx-gray': '#F8FAFC',       // Changed to light
        'black-600': '#374151',       // Lighter for text
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