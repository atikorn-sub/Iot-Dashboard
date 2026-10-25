import type { Device } from '@/types/device';

interface DeviceHeaderProps {
  device: Device | null;
  online: boolean;
  lastPolledAt: Date | null;
}

export const DeviceHeader = ({ device, online, lastPolledAt }: DeviceHeaderProps) => (
  <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
    <div>
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-sky-400">Mini IoT Dashboard</p>
      <h1 className="mt-1 text-2xl font-semibold text-slate-100 sm:text-3xl">{device?.name ?? 'Loading device…'}</h1>
      <p className="mt-1 font-mono text-sm text-slate-500">{device?.device_id ?? '—'}</p>
    </div>

    <div className="flex items-center gap-3 text-sm">
      <span
        className={`inline-flex items-center gap-2 rounded-full px-3 py-1 font-medium ${
          online ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
        }`}
      >
        <span className={`h-2 w-2 rounded-full ${online ? 'animate-pulse bg-emerald-400' : 'bg-rose-400'}`} />
        {online ? 'Online' : 'Offline'}
      </span>
      <span className="text-slate-500">
        Polled {lastPolledAt ? lastPolledAt.toLocaleTimeString() : '—'}
      </span>
    </div>
  </header>
);
