'use client';

import { PreferenceControls } from '@/components/PreferenceControls';
import { usePreferences } from '@/components/PreferencesProvider';
import { intlLocale } from '@/lib/i18n';
import type { Device } from '@/types/device';

interface DeviceHeaderProps {
  device: Device | null;
  online: boolean;
  lastPolledAt: Date | null;
}

export const DeviceHeader = ({ device, online, lastPolledAt }: DeviceHeaderProps) => {
  const { t, locale } = usePreferences();

  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-sky-500 dark:text-sky-400">{t.appTitle}</p>
        <h1 className="mt-1 text-2xl font-semibold text-fg sm:text-3xl">{device?.name ?? t.loadingDevice}</h1>
        <p className="mt-1 font-mono text-sm text-subtle">{device?.device_id ?? '—'}</p>
      </div>

      <div className="flex flex-col items-start gap-3 sm:items-end">
        <PreferenceControls />
        <div className="flex items-center gap-3 text-sm">
          <span
            className={`inline-flex items-center gap-2 rounded-full px-3 py-1 font-medium ${
              online
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
            }`}
          >
            <span className={`h-2 w-2 rounded-full ${online ? 'animate-pulse bg-emerald-500' : 'bg-rose-500'}`} />
            {online ? t.online : t.offline}
          </span>
          <span className="text-subtle">
            {t.polled} {lastPolledAt ? lastPolledAt.toLocaleTimeString(intlLocale[locale]) : '—'}
          </span>
        </div>
      </div>
    </header>
  );
};
