'use client';

import { BoardSimulation } from '@/components/BoardSimulation';
import { DeviceHeader } from '@/components/DeviceHeader';
import { RelayToggle } from '@/components/RelayToggle';
import { SensorGauge } from '@/components/SensorGauge';
import { TelemetryChart } from '@/components/TelemetryChart';
import { useDeviceStatus } from '@/hooks/useDeviceStatus';
import { API_URL, DEVICE_ID, POLL_INTERVAL_MS } from '@/lib/api';

export const Dashboard = () => {
  const { data, error, loading, toggling, lastPolledAt, setStatus } = useDeviceStatus(DEVICE_ID, POLL_INTERVAL_MS);

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 lg:py-12">
      <DeviceHeader device={data?.device ?? null} online={data?.online ?? false} lastPolledAt={lastPolledAt} />

      {error && (
        <div role="alert" className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
          Cannot reach API at <span className="font-mono">{API_URL}</span>: {error}
        </div>
      )}

      {loading && !data ? (
        <div className="grid gap-6 md:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-72 animate-pulse rounded-2xl bg-slate-900/60" />
          ))}
        </div>
      ) : (
        <>
          <section className="grid gap-6 lg:grid-cols-12">
            <div className="order-2 grid gap-6 sm:grid-cols-2 lg:order-1 lg:col-span-3 lg:grid-cols-1">
              <SensorGauge
                label="Temperature"
                value={data?.latest?.temp ?? null}
                unit="°C"
                min={0}
                max={50}
                colorClass="stroke-orange-500"
                icon="🌡️"
              />
              <SensorGauge
                label="Humidity"
                value={data?.latest?.humidity ?? null}
                unit="%RH"
                min={0}
                max={100}
                colorClass="stroke-sky-400"
                icon="💧"
              />
            </div>
            <div className="order-1 lg:order-2 lg:col-span-6">
              <BoardSimulation
                status={data?.device.status ?? 'OFF'}
                latest={data?.latest ?? null}
                online={data?.online ?? false}
                disabled={!data || toggling}
                onToggle={(status) => void setStatus(status)}
              />
            </div>
            <div className="order-3 lg:col-span-3">
              <RelayToggle
                status={data?.device.status ?? 'OFF'}
                disabled={!data || toggling}
                onChange={(status) => void setStatus(status)}
              />
            </div>
          </section>

          <TelemetryChart history={data?.history ?? []} />
        </>
      )}

      <footer className="mt-auto pt-4 text-center text-xs text-slate-600">
        Next.js · Express · MongoDB — polling every {POLL_INTERVAL_MS / 1000}s
      </footer>
    </main>
  );
};
