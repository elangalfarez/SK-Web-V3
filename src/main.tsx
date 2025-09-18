// src/main.tsx
// Modified: Simplified theme initialization that actually works

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Simple theme initialization
const initializeTheme = () => {
  try {
    const stored = localStorage.getItem('theme-preference');
    const theme = (stored === 'dark' || stored === 'light') ? stored : 'light';
    
    document.documentElement.setAttribute('data-theme', theme);
    
    // Apply theme colors immediately to prevent flash
    if (theme === 'dark') {
      document.documentElement.style.setProperty('--color-surface', '#0A0A0A');
      document.documentElement.style.setProperty('--color-text-primary', '#FFFFFF');
      document.documentElement.style.setProperty('--color-accent', '#FFD700');
    } else {
      document.documentElement.style.setProperty('--color-surface', '#FFFFFF');
      document.documentElement.style.setProperty('--color-text-primary', '#1F2937');
      document.documentElement.style.setProperty('--color-accent', '#5A2E8A');
    }
  } catch (error) {
    console.warn('Theme initialization failed:', error);
    // Fallback to light theme
    document.documentElement.setAttribute('data-theme', 'light');
  }
};

// Initialize immediately
initializeTheme();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);