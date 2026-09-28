'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export type ThemePreference = 'light' | 'dark' | 'system';

interface ThemeContextType {
  themePreference: ThemePreference;
  isDarkMode: boolean;
  setThemePreference: (theme: ThemePreference) => void;
  toggleTheme: () => void;
  // Backward compatibility alias:
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
}

const ThemeContext = createContext<ThemeContextType>({
  themePreference: 'system',
  isDarkMode: false,
  setThemePreference: () => {},
  toggleTheme: () => {},
  theme: 'light',
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themePreference, setThemePreferenceState] = useState<ThemePreference>('system');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);

  const applyTheme = (pref: ThemePreference) => {
    const isDark =
      pref === 'dark' ||
      (pref === 'system' &&
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-color-scheme: dark)').matches);

    setIsDarkMode(isDark);
    if (typeof document !== 'undefined') {
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  };

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('theme') as ThemePreference | null;
    const initialPref: ThemePreference = saved || 'system';
    setThemePreferenceState(initialPref);
    applyTheme(initialPref);

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      const currentSaved = localStorage.getItem('theme') as ThemePreference | null;
      if (!currentSaved || currentSaved === 'system') {
        applyTheme('system');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const setThemePreference = (newPref: ThemePreference) => {
    setThemePreferenceState(newPref);
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', newPref);
    }
    applyTheme(newPref);
  };

  const toggleTheme = () => {
    const nextPref: ThemePreference = isDarkMode ? 'light' : 'dark';
    setThemePreference(nextPref);
  };

  const setTheme = (theme: 'light' | 'dark') => {
    setThemePreference(theme);
  };

  return (
    <ThemeContext.Provider
      value={{
        themePreference,
        isDarkMode,
        setThemePreference,
        toggleTheme,
        theme: isDarkMode ? 'dark' : 'light',
        setTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
