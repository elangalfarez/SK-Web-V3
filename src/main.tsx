// src/main.tsx
// Modified: Initialize dark theme on app startup

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initializeTheme } from './lib/theme-config';

// Initialize the dark theme immediately on app startup
initializeTheme();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);