// src/lib/theme-config.ts
// Updated: Changed default theme from 'light' to 'dark'

import { useState, useEffect, useCallback } from 'react';

export type ThemeName = 'light' | 'dark';

export interface ThemeColors {
  // Surfaces
  surface: string;
  surfaceSecondary: string;
  surfaceTertiary: string;
  
  // Text
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textInverse: string;
  
  // Accent
  accent: string;
  accentHover: string;
  accentLight: string;
  accentSubtle: string;
  
  // Interactive
  interactive: string;
  interactiveHover: string;
  interactiveMuted: string;
  
  // Borders
  borderPrimary: string;
  borderSecondary: string;
  borderMuted: string;
  
  // Status
  success: string;
  warning: string;
  error: string;
  info: string;
}

export const themes: Record<ThemeName, ThemeColors> = {
  light: {
    // Surfaces - Clean whites
    surface: '#FFFFFF',
    surfaceSecondary: '#FFFFFF',
    surfaceTertiary: '#F8FAFC',
    
    // Text - Elegant grays
    textPrimary: '#1F2937',
    textSecondary: '#4B5563',
    textMuted: '#6B7280',
    textInverse: '#FFFFFF',
    
    // Accent - Royal purple palette
    accent: '#5A2E8A',
    accentHover: '#4A256F',
    accentLight: '#8B5FBF',
    accentSubtle: '#F3F0FF',
    
    // Interactive
    interactive: '#5A2E8A',
    interactiveHover: '#4A256F',
    interactiveMuted: '#8B5FBF',
    
    // Borders
    borderPrimary: '#E5E7EB',
    borderSecondary: '#F3F4F6',
    borderMuted: '#F9FAFB',
    
    // Status
    success: '#059669',
    warning: '#D97706',
    error: '#DC2626',
    info: '#2563EB',
  },
  dark: {
    // Surfaces - Rich blacks
    surface: '#0A0A0A',
    surfaceSecondary: '#1A1A1A',
    surfaceTertiary: '#2A2A2A',
    
    // Text - High contrast whites
    textPrimary: '#FFFFFF',
    textSecondary: '#E5E5E5',
    textMuted: '#A1A1A1',
    textInverse: '#FFFFFF',
    
    // Accent - Premium purple palette
    accent: '#9E61FF',
    accentHover: '#A47FD5',
    accentLight: '#761dbe',
    accentSubtle: '#2A2317',
    
    // Interactive
    interactive: '#9E61FF',
    interactiveHover: '#A47FD5',
    interactiveMuted: '#2A2317',
    
    // Borders
    borderPrimary: '#404040',
    borderSecondary: '#2A2A2A',
    borderMuted: '#1A1A1A',
    
    // Status
    success: '#10B981',
    warning: '#FFD700',
    error: '#EF4444',
    info: '#3B82F6',
  },
};

// Global theme change listeners
const themeChangeListeners = new Set<(theme: ThemeName) => void>();

/**
 * Subscribe to global theme changes
 */
export function subscribeToThemeChanges(listener: (theme: ThemeName) => void) {
  themeChangeListeners.add(listener);
  return () => {
    themeChangeListeners.delete(listener);
  };
}

/**
 * Notify all listeners about theme change
 */
function notifyThemeChange(theme: ThemeName) {
  themeChangeListeners.forEach(listener => {
    try {
      listener(theme);
    } catch (error) {
      console.warn('Theme change listener error:', error);
    }
  });
}

/**
 * Apply theme to document with global state sync
 */
export function applyTheme(themeName: ThemeName): void {
  const theme = themes[themeName];
  const root = document.documentElement;
  
  // Set theme attribute
  root.setAttribute('data-theme', themeName);
  
  // Apply CSS custom properties
  Object.entries(theme).forEach(([key, value]) => {
    const cssVar = `--color-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
    root.style.setProperty(cssVar, value);
  });
  
  // Store preference
  try {
    localStorage.setItem('theme-preference', themeName);
  } catch (error) {
    console.warn('Cannot save theme preference:', error);
  }
  
  // Notify all components about the theme change
  notifyThemeChange(themeName);
}

/**
 * Get theme preference - Defaults to DARK
 */
export function getThemePreference(): ThemeName {
  if (typeof window === 'undefined') return 'dark'; // ← Changed from 'light'
  
  try {
    const stored = localStorage.getItem('theme-preference') as ThemeName;
    if (stored === 'light' || stored === 'dark') return stored;
  } catch (error) {
    console.warn('Cannot read theme preference:', error);
  }
  
  return 'dark'; // ← Changed from 'light' - Always default to dark
}

/**
 * Initialize theme system
 */
export function initializeTheme(): ThemeName {
  const theme = getThemePreference();
  applyTheme(theme);
  return theme;
}

/**
 * Toggle theme with global state sync
 */
export function toggleTheme(): ThemeName {
  const current = getThemePreference();
  const next = current === 'light' ? 'dark' : 'light';
  applyTheme(next);
  return next;
}

/**
 * Enhanced React hook with global theme sync
 */
export function useTheme() {
  const [currentTheme, setCurrentTheme] = useState<ThemeName>('dark'); // Initial state already correct
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Initialize theme
    const theme = initializeTheme();
    setCurrentTheme(theme);
    setIsLoading(false);
    
    // Subscribe to global theme changes
    const unsubscribe = subscribeToThemeChanges((newTheme) => {
      setCurrentTheme(newTheme);
    });
    
    return unsubscribe;
  }, []);
  
  const switchTheme = useCallback((theme: ThemeName) => {
    applyTheme(theme);
  }, []);
  
  const toggleThemeMode = useCallback(() => {
    toggleTheme();
  }, []);
  
  return {
    currentTheme,
    switchTheme,
    toggleTheme: toggleThemeMode,
    themes: ['light', 'dark'] as ThemeName[],
    isLoading,
  };
}