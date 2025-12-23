// src/main.tsx
// Modified: Use centralized theme system for consistent initialization

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initializeTheme } from './lib/theme-config';
import { HelmetProvider } from 'react-helmet-async';

// Initialize theme system immediately to prevent flash
initializeTheme();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </StrictMode>
);