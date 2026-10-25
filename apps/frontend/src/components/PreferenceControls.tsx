'use client';

import { usePreferences } from '@/components/PreferencesProvider';
import { LOCALES } from '@/lib/i18n';

const LOCALE_LABELS = { en: 'EN', th: 'ไทย' } as const;

const SunIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </svg>
);

const MoonIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
  </svg>
);

export const PreferenceControls = () => {
  const { theme, locale, t, toggleTheme, setLocale } = usePreferences();

  return (
    <div className="flex items-center gap-2">
      <div role="group" aria-label={t.languageLabel} className="flex rounded-full border border-line bg-surface p-0.5 text-xs font-medium">
        {LOCALES.map((code) => (
          <button
            key={code}
            type="button"
            aria-pressed={locale === code}
            onClick={() => setLocale(code)}
            className={`rounded-full px-3 py-1 transition-colors ${
              locale === code ? 'bg-sky-500 text-white' : 'text-muted hover:text-fg'
            }`}
          >
            {LOCALE_LABELS[code]}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={toggleTheme}
        aria-label={theme === 'dark' ? t.switchToLight : t.switchToDark}
        title={theme === 'dark' ? t.switchToLight : t.switchToDark}
        className="flex h-8 w-8 items-center justify-center rounded-full border border-line bg-surface text-muted transition-colors hover:text-fg"
      >
        {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
      </button>
    </div>
  );
};
