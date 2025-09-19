// tailwind.config.js
// Modified: Updated fontFamily to use  for all text elements

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Semantic Theme System - Can easily switch between themes
        // Current: Light (White/Purple) Theme
        
        // Main Surfaces
        'surface': 'var(--color-surface)',                    // Main backgrounds
        'surface-secondary': 'var(--color-surface-secondary)', // Cards, panels
        'surface-tertiary': 'var(--color-surface-tertiary)',   // Subtle backgrounds
        
        // Text Colors
        'text-primary': 'var(--color-text-primary)',         // Main text
        'text-secondary': 'var(--color-text-secondary)',     // Secondary text
        'text-muted': 'var(--color-text-muted)',             // Muted text
        'text-inverse': 'var(--color-text-inverse)',         // Text on dark backgrounds
        
        // Accent Colors
        'accent': 'var(--color-accent)',                     // Primary accent
        'accent-hover': 'var(--color-accent-hover)',         // Accent hover state
        'accent-light': 'var(--color-accent-light)',         // Light accent variant
        'accent-subtle': 'var(--color-accent-subtle)',       // Very subtle accent
        
        // Interactive States
        'interactive': 'var(--color-interactive)',           // Buttons, links
        'interactive-hover': 'var(--color-interactive-hover)', // Hover states
        'interactive-muted': 'var(--color-interactive-muted)', // Muted interactive
        
        // Borders & Dividers
        'border-primary': 'var(--color-border-primary)',     // Main borders
        'border-secondary': 'var(--color-border-secondary)', // Secondary borders
        'border-muted': 'var(--color-border-muted)',         // Subtle borders
        
        // Status & Feedback
        'success': 'var(--color-success)',
        'warning': 'var(--color-warning)',
        'error': 'var(--color-error)',
        'info': 'var(--color-info)',
        
        // Legacy color support (gradually replace these)
        'primary': 'var(--color-surface)',
        'secondary': 'var(--color-accent)',
        'royal-purple': 'var(--color-accent)',
        'dark-purple': 'var(--color-accent-hover)',
        'light-purple': 'var(--color-accent-light)',
        'gold': 'var(--color-accent)',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'sans-serif'],
         'commissioner': ['Commissioner', 'sans-serif'],
      },
      flex: {
        '2': '2 2 0%',
      },
      screens: {
        '3xl': '1600px',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};