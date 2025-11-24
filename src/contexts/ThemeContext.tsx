'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Theme, ThemeMode, darkTheme, lightTheme } from '@/types/theme';

interface ThemeContextType {
  theme: Theme;
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
  }, [theme]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
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
