'use client';

import { useState } from 'react';
import { BoardSimulation } from '@/components/BoardSimulation';
import { GreenhouseScene } from '@/components/GreenhouseScene';
import { usePreferences } from '@/components/PreferencesProvider';
import type { DeviceStatus, Telemetry } from '@/types/device';

interface DeviceVisualProps {
  status: DeviceStatus;
  latest: Telemetry | null;
  online: boolean;
  disabled: boolean;
  onToggle: (status: DeviceStatus) => void;
}

type View = 'greenhouse' | 'circuit';

const VIEWS: readonly View[] = ['greenhouse', 'circuit'];
const VIEW_ICONS: Record<View, string> = { greenhouse: '🌱', circuit: '🔌' };

/** Center card: the same live device shown as its real-world context or as its wiring */
export const DeviceVisual = (props: DeviceVisualProps) => {
  const { t } = usePreferences();
  const [view, setView] = useState<View>('greenhouse');

  return (
    <div className="flex h-full flex-col rounded-2xl border border-line bg-surface p-6 shadow-lg">
      <div className="flex items-center justify-between text-sm text-muted">
        <span className="font-medium uppercase tracking-wider">{t.boardTitle}</span>
        <span className="text-xs text-subtle">{view === 'greenhouse' ? t.sceneHint : t.boardHint}</span>
      </div>

      <div role="tablist" aria-label={t.boardTitle} className="mt-3 flex w-fit rounded-full border border-line p-0.5 text-xs font-medium">
        {VIEWS.map((option) => (
          <button
            key={option}
            type="button"
            role="tab"
            aria-selected={view === option}
            onClick={() => setView(option)}
            className={`rounded-full px-3 py-1 transition-colors ${
              view === option ? 'bg-sky-500 text-white' : 'text-muted hover:text-fg'
            }`}
          >
            <span aria-hidden>{VIEW_ICONS[option]}</span> {t.views[option]}
          </button>
        ))}
      </div>

      <div role="tabpanel" className="flex flex-1 items-center justify-center py-4">
        {view === 'greenhouse' ? <GreenhouseScene {...props} /> : <BoardSimulation {...props} />}
      </div>

      {view === 'greenhouse' && <p className="text-center text-xs text-subtle">{t.sceneCaption}</p>}
    </div>
  );
};
