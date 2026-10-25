'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { dictionaries, LOCALES, type Dictionary, type Locale } from '@/lib/i18n';
import { STORAGE_KEYS, type Theme } from '@/lib/preferences';

interface PreferencesContextValue {
  theme: Theme;
  locale: Locale;
  t: Dictionary;
  toggleTheme: () => void;
  setLocale: (locale: Locale) => void;
}

const PreferencesContext = createContext<PreferencesContextValue | null>(null);

const readStorage = (key: string): string | null => {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
};

const writeStorage = (key: string, value: string): void => {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Storage can be unavailable (private mode); preferences then last for the session only
  }
};

const isLocale = (value: string | null): value is Locale =>
  value !== null && (LOCALES as readonly string[]).includes(value);

export const PreferencesProvider = ({ children }: { children: ReactNode }) => {
  // Server render uses the defaults; stored preferences are applied after hydration
  const [theme, setTheme] = useState<Theme>('dark');
  const [locale, setLocale] = useState<Locale>('en');
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (readStorage(STORAGE_KEYS.theme) === 'light') setTheme('light');
    const storedLocale = readStorage(STORAGE_KEYS.locale);
    if (isLocale(storedLocale)) setLocale(storedLocale);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    document.documentElement.classList.toggle('dark', theme === 'dark');
    writeStorage(STORAGE_KEYS.theme, theme);
  }, [theme, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    document.documentElement.lang = locale;
    writeStorage(STORAGE_KEYS.locale, locale);
  }, [locale, hydrated]);

  const toggleTheme = useCallback(() => setTheme((current) => (current === 'dark' ? 'light' : 'dark')), []);

  const value = useMemo<PreferencesContextValue>(
    () => ({ theme, locale, t: dictionaries[locale], toggleTheme, setLocale }),
    [theme, locale, toggleTheme],
  );

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
};

export const usePreferences = (): PreferencesContextValue => {
  const context = useContext(PreferencesContext);
  if (!context) throw new Error('usePreferences must be used inside <PreferencesProvider>');
  return context;
};
