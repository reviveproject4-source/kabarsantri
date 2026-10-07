/**
 * THEME STORE — LIGHT MODE & DARK MODE
 * KabarSantri v2.0
 */

'use client';

import { useState, useEffect } from 'react';

export type ThemeMode = 'light' | 'dark';

const THEME_STORAGE_KEY = 'ks_theme_mode_v2';
const THEME_EVENT_NAME = 'ks_theme_changed';

export function getInitialTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'light';
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode | null;
    if (saved === 'dark' || saved === 'light') return saved;
    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  } catch {
    return 'light';
  }
}

export function applyTheme(theme: ThemeMode) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (theme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}

export function setThemeMode(theme: ThemeMode): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
    applyTheme(theme);
    window.dispatchEvent(new CustomEvent(THEME_EVENT_NAME, { detail: theme }));
  } catch {}
}

export function useThemeMode(): {
  theme: ThemeMode;
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (t: ThemeMode) => void;
} {
  const [theme, setThemeState] = useState<ThemeMode>('light');

  useEffect(() => {
    const initial = getInitialTheme();
    setThemeState(initial);
    applyTheme(initial);

    const handleThemeChange = (e: Event) => {
      const custom = e as CustomEvent<ThemeMode>;
      const newTheme = custom.detail || getInitialTheme();
      setThemeState(newTheme);
      applyTheme(newTheme);
    };

    window.addEventListener(THEME_EVENT_NAME, handleThemeChange);
    return () => window.removeEventListener(THEME_EVENT_NAME, handleThemeChange);
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setThemeMode(next);
    setThemeState(next);
  };

  const setTheme = (t: ThemeMode) => {
    setThemeMode(t);
    setThemeState(t);
  };

  return {
    theme,
    isDark: theme === 'dark',
    toggleTheme,
    setTheme
  };
}
