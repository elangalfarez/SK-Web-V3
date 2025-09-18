// src/components/ui/theme-toggle.tsx
// Created: Simplified, bulletproof theme toggle that actually works

import React, { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';

interface ThemeToggleProps {
  variant?: 'default' | 'mobile';
  showLabel?: boolean;
  className?: string;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ 
  variant = 'default',
  showLabel = false,
  className = ''
}) => {
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);

  // Initialize theme on mount
  useEffect(() => {
    const getTheme = (): 'light' | 'dark' => {
      const stored = localStorage.getItem('theme-preference');
      if (stored === 'light' || stored === 'dark') return stored;
      return 'light'; // Default to light
    };

    const theme = getTheme();
    setCurrentTheme(theme);
    applyTheme(theme);
    setMounted(true);
  }, []);

  const applyTheme = (theme: 'light' | 'dark') => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    
    // Apply theme colors based on your existing CSS variables
    if (theme === 'dark') {
      root.style.setProperty('--color-surface', '#0A0A0A');
      root.style.setProperty('--color-surface-secondary', '#1A1A1A');
      root.style.setProperty('--color-surface-tertiary', '#2A2A2A');
      root.style.setProperty('--color-text-primary', '#FFFFFF');
      root.style.setProperty('--color-text-secondary', '#E5E5E5');
      root.style.setProperty('--color-text-muted', '#A1A1A1');
      root.style.setProperty('--color-text-inverse', '#0A0A0A');
      root.style.setProperty('--color-accent', '#FFD700');
      root.style.setProperty('--color-accent-hover', '#FFC107');
      root.style.setProperty('--color-accent-light', '#FFECB3');
      root.style.setProperty('--color-accent-subtle', '#2A2317');
      root.style.setProperty('--color-interactive', '#FFD700');
      root.style.setProperty('--color-interactive-hover', '#FFC107');
      root.style.setProperty('--color-interactive-muted', '#B8860B');
      root.style.setProperty('--color-border-primary', '#404040');
      root.style.setProperty('--color-border-secondary', '#2A2A2A');
      root.style.setProperty('--color-border-muted', '#1A1A1A');
    } else {
      root.style.setProperty('--color-surface', '#FFFFFF');
      root.style.setProperty('--color-surface-secondary', '#FFFFFF');
      root.style.setProperty('--color-surface-tertiary', '#F8FAFC');
      root.style.setProperty('--color-text-primary', '#1F2937');
      root.style.setProperty('--color-text-secondary', '#4B5563');
      root.style.setProperty('--color-text-muted', '#6B7280');
      root.style.setProperty('--color-text-inverse', '#FFFFFF');
      root.style.setProperty('--color-accent', '#5A2E8A');
      root.style.setProperty('--color-accent-hover', '#4A256F');
      root.style.setProperty('--color-accent-light', '#8B5FBF');
      root.style.setProperty('--color-accent-subtle', '#F3F0FF');
      root.style.setProperty('--color-interactive', '#5A2E8A');
      root.style.setProperty('--color-interactive-hover', '#4A256F');
      root.style.setProperty('--color-interactive-muted', '#8B5FBF');
      root.style.setProperty('--color-border-primary', '#E5E7EB');
      root.style.setProperty('--color-border-secondary', '#F3F4F6');
      root.style.setProperty('--color-border-muted', '#F9FAFB');
    }
    
    localStorage.setItem('theme-preference', theme);
  };

  const toggleTheme = () => {
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    setCurrentTheme(newTheme);
    applyTheme(newTheme);
  };

  // Don't render until mounted to prevent hydration issues
  if (!mounted) {
    return (
      <div className={`w-12 h-12 rounded-full bg-gray-200 animate-pulse ${className}`} />
    );
  }

  const isDark = currentTheme === 'dark';

  if (variant === 'mobile') {
    return (
      <button
        onClick={toggleTheme}
        className={`flex items-center space-x-3 w-full px-4 py-3 rounded-lg transition-all duration-200 hover:bg-surface-tertiary ${className}`}
        aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
      >
        <div className="relative w-10 h-10 rounded-full bg-surface-secondary border border-border-primary flex items-center justify-center transition-all duration-200 hover:shadow-md">
          <motion.div
            key={isDark ? 'sun' : 'moon'}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="text-accent"
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} fill="currentColor" />}
          </motion.div>
        </div>
        {showLabel && (
          <span className="text-sm font-medium text-text-primary">
            {isDark ? 'Switch to Light' : 'Switch to Dark'}
          </span>
        )}
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className={`relative w-12 h-12 rounded-full bg-surface-secondary border border-border-primary flex items-center justify-center transition-all duration-200 hover:shadow-lg hover:scale-105 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 ${className}`}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
    >
      <motion.div
        key={isDark ? 'sun' : 'moon'}
        initial={{ scale: 0.5, opacity: 0, rotate: -90 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        transition={{ duration: 0.3, ease: "backOut" }}
        className="text-accent"
      >
        {isDark ? <Sun size={20} /> : <Moon size={20} fill="currentColor" />}
      </motion.div>
    </button>
  );
};

export default ThemeToggle;