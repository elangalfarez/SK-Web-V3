// src/components/ui/theme-toggle.tsx
// Modified: Removed unused showLabel prop to fix TypeScript warning

import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '@/lib/theme-config';

interface ThemeToggleProps {
  variant?: 'default' | 'compact';
  className?: string;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ 
  variant = 'default',
  className = ''
}) => {
  const { currentTheme, toggleTheme: toggleThemeMode, isLoading } = useTheme();

  // Show skeleton while loading
  if (isLoading) {
    const skeletonSize = variant === 'compact' ? 'w-10 h-10' : 'w-12 h-12';
    return (
      <div className={`${skeletonSize} rounded-full bg-gray-200 animate-pulse ${className}`} />
    );
  }

  const isDark = currentTheme === 'dark';

  // Compact variant for mobile (beside hamburger menu)
  if (variant === 'compact') {
    return (
      <button
        onClick={toggleThemeMode}
        className={`relative w-10 h-10 rounded-full bg-surface-secondary border border-border-primary flex items-center justify-center transition-all duration-200 hover:shadow-lg hover:scale-105 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 ${className}`}
        aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
        style={{
          backgroundColor: 'var(--color-surface-secondary)',
          borderColor: 'var(--color-border-primary)',
        }}
      >
        <motion.div
          key={isDark ? 'sun' : 'moon'}
          initial={{ scale: 0.5, opacity: 0, rotate: -90 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ duration: 0.3, ease: "backOut" }}
          style={{ color: 'var(--color-accent)' }}
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} fill="currentColor" />}
        </motion.div>
      </button>
    );
  }

  // Default variant for desktop
  return (
    <button
      onClick={toggleThemeMode}
      className={`relative w-12 h-12 rounded-full bg-surface-secondary border border-border-primary flex items-center justify-center transition-all duration-200 hover:shadow-lg hover:scale-105 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 ${className}`}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
      style={{
        backgroundColor: 'var(--color-surface-secondary)',
        borderColor: 'var(--color-border-primary)',
      }}
    >
      <motion.div
        key={isDark ? 'sun' : 'moon'}
        initial={{ scale: 0.5, opacity: 0, rotate: -90 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        transition={{ duration: 0.3, ease: "backOut" }}
        style={{ color: 'var(--color-accent)' }}
      >
        {isDark ? <Sun size={20} /> : <Moon size={20} fill="currentColor" />}
      </motion.div>
    </button>
  );
};

export default ThemeToggle;