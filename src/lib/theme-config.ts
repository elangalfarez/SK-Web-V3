// src/lib/theme-config.ts
// Modified: Simplified theme management that actually works reliably

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
    textInverse: '#0A0A0A',
    
    // Accent - Premium gold palette
    accent: '#FFD700',
    accentHover: '#FFC107',
    accentLight: '#FFECB3',
    accentSubtle: '#2A2317',
    
    // Interactive
    interactive: '#FFD700',
    interactiveHover: '#FFC107',
    interactiveMuted: '#B8860B',
    
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

/**
 * Apply theme to document - Simple and reliable
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
}

/**
 * Get theme preference - Defaults to light
 */
export function getThemePreference(): ThemeName {
  if (typeof window === 'undefined') return 'light';
  
  try {
    const stored = localStorage.getItem('theme-preference') as ThemeName;
    if (stored === 'light' || stored === 'dark') return stored;
  } catch (error) {
    console.warn('Cannot read theme preference:', error);
  }
  
  return 'light'; // Always default to light
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
 * Toggle theme
 */
export function toggleTheme(): ThemeName {
  const current = getThemePreference();
  const next = current === 'light' ? 'dark' : 'light';
  applyTheme(next);
  return next;
}

/**
 * Simplified React hook for theme
 */
export function useTheme() {
  const [currentTheme, setCurrentTheme] = useState<ThemeName>('light');
  
  useEffect(() => {
    const theme = initializeTheme();
    setCurrentTheme(theme);
  }, []);
  
  const switchTheme = useCallback((theme: ThemeName) => {
    applyTheme(theme);
    setCurrentTheme(theme);
  }, []);
  
  const toggleThemeMode = useCallback(() => {
    const newTheme = toggleTheme();
    setCurrentTheme(newTheme);
  }, []);
  
  return {
    currentTheme,
    switchTheme,
    toggleTheme: toggleThemeMode,
    themes: ['light', 'dark'] as ThemeName[],
  };
}