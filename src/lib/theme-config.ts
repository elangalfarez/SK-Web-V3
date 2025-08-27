// src/lib/theme-config.ts

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
    // Surfaces
    surface: '#FFFFFF',
    surfaceSecondary: '#FFFFFF',
    surfaceTertiary: '#F8FAFC',
    
    // Text
    textPrimary: '#1F2937',
    textSecondary: '#4B5563',
    textMuted: '#6B7280',
    textInverse: '#FFFFFF',
    
    // Accent (Purple)
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
    // Surfaces
    surface: '#1F2937',
    surfaceSecondary: '#374151',
    surfaceTertiary: '#4B5563',
    
    // Text
    textPrimary: '#F9FAFB',
    textSecondary: '#D1D5DB',
    textMuted: '#9CA3AF',
    textInverse: '#1F2937',
    
    // Accent (Gold)
    accent: '#F59E0B',
    accentHover: '#D97706',
    accentLight: '#FCD34D',
    accentSubtle: '#451A03',
    
    // Interactive
    interactive: '#F59E0B',
    interactiveHover: '#D97706',
    interactiveMuted: '#92400E',
    
    // Borders
    borderPrimary: '#4B5563',
    borderSecondary: '#374151',
    borderMuted: '#1F2937',
    
    // Status
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
  },
};

/**
 * Apply theme to the document
 */
export function applyTheme(themeName: ThemeName): void {
  const theme = themes[themeName];
  const root = document.documentElement;
  
  // Set theme attribute for CSS selector
  root.setAttribute('data-theme', themeName);
  
  // Apply CSS custom properties
  Object.entries(theme).forEach(([key, value]) => {
    const cssVar = `--color-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
    root.style.setProperty(cssVar, value);
  });
  
  // Store preference
  localStorage.setItem('theme-preference', themeName);
}

/**
 * Get user's theme preference
 */
export function getThemePreference(): ThemeName {
  if (typeof window === 'undefined') return 'light';
  
  const stored = localStorage.getItem('theme-preference') as ThemeName;
  if (stored && themes[stored]) return stored;
  
  // Default to light theme
  return 'light';
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
 * Toggle between light and dark themes
 */
export function toggleTheme(): ThemeName {
  const current = getThemePreference();
  const next = current === 'light' ? 'dark' : 'light';
  applyTheme(next);
  return next;
}

/**
 * React hook for theme management
 */
export function useTheme() {
  const [currentTheme, setCurrentTheme] = useState<ThemeName>('light');
  
  useEffect(() => {
    setCurrentTheme(initializeTheme());
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
    themes: Object.keys(themes) as ThemeName[],
  };
}

// Import React hooks for the useTheme hook
import { useState, useEffect, useCallback } from 'react';