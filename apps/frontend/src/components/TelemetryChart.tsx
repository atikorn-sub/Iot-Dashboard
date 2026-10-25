'use client';

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { Telemetry } from '@/types/device';

interface TelemetryChartProps {
  history: Telemetry[];
}

interface ChartPoint {
  time: string;
  temp: number;
  humidity: number;
}

const formatTime = (iso: string): string =>
  new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

export const TelemetryChart = ({ history }: TelemetryChartProps) => {
  const points: ChartPoint[] = history.map((t) => ({
    time: formatTime(t.timestamp),
    temp: t.temp,
    humidity: t.humidity,
  }));

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-lg">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-medium uppercase tracking-wider text-slate-400">Telemetry history</h2>
        <span className="text-xs text-slate-500">Last {points.length} readings</span>
      </div>

      {points.length === 0 ? (
        <div className="flex h-72 items-center justify-center text-sm text-slate-500">
          Waiting for telemetry… run <code className="mx-1 rounded bg-slate-800 px-1.5 py-0.5">npm run simulate</code>
        </div>
      ) : (
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={points} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="time" stroke="#64748b" fontSize={11} tickMargin={8} minTickGap={24} />
              <YAxis yAxisId="temp" stroke="#f97316" fontSize={11} domain={['auto', 'auto']} unit="°" />
              <YAxis
                yAxisId="humidity"
                orientation="right"
                stroke="#38bdf8"
                fontSize={11}
                domain={[0, 100]}
                unit="%"
              />
              <Tooltip
                contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 8 }}
                labelStyle={{ color: '#94a3b8' }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line
                yAxisId="temp"
                type="monotone"
                dataKey="temp"
                name="Temperature (°C)"
                stroke="#f97316"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
              <Line
                yAxisId="humidity"
                type="monotone"
                dataKey="humidity"
                name="Humidity (%)"
                stroke="#38bdf8"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};
