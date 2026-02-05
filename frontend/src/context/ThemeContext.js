import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const ThemeContext = createContext(null);

const themes = {
  light: {
    name: 'light',
    colors: {
      background: '#ffffff',
      surface: '#f8fafc',
      primary: '#2563eb',
      primaryHover: '#1d4ed8',
      secondary: '#64748b',
      text: '#0f172a',
      textMuted: '#64748b',
      border: '#e2e8f0',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      card: '#ffffff',
      cardBorder: '#e2e8f0',
      hover: '#f1f5f9',
      inputBg: '#ffffff',
      shadow: 'rgba(0, 0, 0, 0.1)'
    }
  },
  dark: {
    name: 'dark',
    colors: {
      background: '#0f172a',
      surface: '#1e293b',
      primary: '#3b82f6',
      primaryHover: '#60a5fa',
      secondary: '#94a3b8',
      text: '#f1f5f9',
      textMuted: '#94a3b8',
      border: '#334155',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      card: '#1e293b',
      cardBorder: '#334155',
      hover: '#334155',
      inputBg: '#0f172a',
      shadow: 'rgba(0, 0, 0, 0.3)'
    }
  }
};

export function ThemeProvider({ children }) {
  const [themeName, setThemeName] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved) return saved;
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
    }
    return 'light';
  });

  const [systemPreference, setSystemPreference] = useState('light');

  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      setSystemPreference(mediaQuery.matches ? 'dark' : 'light');
      
      const handleChange = (e) => {
        setSystemPreference(e.matches ? 'dark' : 'light');
      };
      
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, []);

  const theme = themeName === 'system' ? themes[systemPreference] : themes[themeName];

  const setTheme = useCallback((name) => {
    setThemeName(name);
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', name);
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(themeName === 'dark' ? 'light' : 'dark');
  }, [themeName, setTheme]);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      Object.entries(theme.colors).forEach(([key, value]) => {
        root.style.setProperty(`--color-${key}`, value);
      });
      root.setAttribute('data-theme', themeName);
      if (typeof window !== 'undefined') {
        localStorage.setItem('currentTheme', themeName);
      }
    }
  }, [theme, themeName]);

  const value = {
    theme,
    themeName,
    setTheme,
    toggleTheme,
    isDark: themeName === 'dark',
    isSystem: themeName === 'system'
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export default ThemeContext;
