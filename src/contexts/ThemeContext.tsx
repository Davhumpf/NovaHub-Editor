'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Theme, ThemeMode, darkTheme, lightTheme } from '@/types/theme';

interface ThemeContextType {
  theme: Theme;
  colors: Theme['colors'];
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  setCustomTheme: (theme: Theme) => void;
  availableThemes: Theme[];
  addTheme: (theme: Theme) => void;
  removeTheme: (themeId: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [themeMode, setThemeModeState] = useState<ThemeMode>('dark');
  const [customTheme, setCustomThemeState] = useState<Theme | null>(null);
  const [availableThemes, setAvailableThemes] = useState<Theme[]>([darkTheme, lightTheme]);

  // Load theme preference from localStorage on mount
  useEffect(() => {
    const savedThemeMode = localStorage.getItem('novahub-theme-mode');
    const savedCustomTheme = localStorage.getItem('novahub-custom-theme');
    const savedAvailableThemes = localStorage.getItem('novahub-available-themes');

    if (savedThemeMode) {
      setThemeModeState(savedThemeMode as ThemeMode);
    }

    if (savedCustomTheme) {
      try {
        const parsed = JSON.parse(savedCustomTheme);
        setCustomThemeState(parsed);
      } catch (error) {
        console.error('Failed to parse custom theme:', error);
      }
    }

    if (savedAvailableThemes) {
      try {
        const parsed = JSON.parse(savedAvailableThemes);
        setAvailableThemes(parsed);
      } catch (error) {
        console.error('Failed to parse available themes:', error);
      }
    }
  }, []);

  // Save theme preference to localStorage whenever it changes
  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
    localStorage.setItem('novahub-theme-mode', mode);
  };

  const setCustomTheme = (theme: Theme) => {
    setCustomThemeState(theme);
    setThemeModeState('custom');
    localStorage.setItem('novahub-custom-theme', JSON.stringify(theme));
    localStorage.setItem('novahub-theme-mode', 'custom');
  };

  const addTheme = (theme: Theme) => {
    const newThemes = [...availableThemes, theme];
    setAvailableThemes(newThemes);
    localStorage.setItem('novahub-available-themes', JSON.stringify(newThemes));
  };

  const removeTheme = (themeId: string) => {
    const newThemes = availableThemes.filter(t => t.id !== themeId);
    setAvailableThemes(newThemes);
    localStorage.setItem('novahub-available-themes', JSON.stringify(newThemes));

    // If the removed theme was active, switch to dark theme
    if (customTheme?.id === themeId || (themeMode === 'custom' && customTheme?.id === themeId)) {
      setThemeMode('dark');
      setCustomThemeState(null);
    }
  };

  // Get current theme based on mode
  const getCurrentTheme = (): Theme => {
    if (themeMode === 'custom' && customTheme) {
      return customTheme;
    }
    return themeMode === 'light' ? lightTheme : darkTheme;
  };

  const theme = getCurrentTheme();

  // Apply theme colors to CSS variables
  useEffect(() => {
    const root = document.documentElement;

    Object.entries(theme.colors).forEach(([key, value]) => {
      // Convert camelCase to kebab-case
      const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
      root.style.setProperty(`--theme-${cssKey}`, value);
    });

    const toRgba = (hex: string, alpha: number) => {
      const normalized = hex.replace('#', '');
      const bigint = parseInt(normalized.length === 3 ? normalized.repeat(2) : normalized, 16);
      const r = (bigint >> 16) & 255;
      const g = (bigint >> 8) & 255;
      const b = bigint & 255;
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };

    const glow = `radial-gradient(circle at 18% 18%, ${toRgba(theme.colors.accent, 0.16)}, transparent 30%),
      radial-gradient(circle at 82% 0%, ${toRgba(theme.colors.info, 0.18)}, transparent 34%),
      radial-gradient(circle at 20% 90%, ${toRgba(theme.colors.success, 0.12)}, transparent 32%)`;

    root.style.setProperty('--theme-glow', glow);
    document.body.style.background = `${glow}, linear-gradient(145deg, ${theme.colors.background} 0%, ${theme.colors.backgroundSecondary} 40%, ${theme.colors.background} 100%)`;
    document.body.style.color = theme.colors.foreground;
    document.body.style.transition = 'background-color 200ms ease, color 200ms ease';
  }, [theme]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        colors: theme.colors,
        themeMode,
        setThemeMode,
        setCustomTheme,
        availableThemes,
        addTheme,
        removeTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
