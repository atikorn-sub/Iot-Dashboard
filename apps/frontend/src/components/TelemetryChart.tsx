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
import { usePreferences } from '@/components/PreferencesProvider';
import { intlLocale } from '@/lib/i18n';
import type { Theme } from '@/lib/preferences';
import type { Telemetry } from '@/types/device';

interface TelemetryChartProps {
  history: Telemetry[];
}

interface ChartPoint {
  time: string;
  temp: number;
  humidity: number;
}

// Recharts takes colors as props, so theme-dependent values are resolved here
const CHART_COLORS: Record<Theme, { grid: string; tooltipBg: string; tooltipBorder: string }> = {
  dark: { grid: '#1e293b', tooltipBg: '#0f172a', tooltipBorder: '#334155' },
  light: { grid: '#e2e8f0', tooltipBg: '#ffffff', tooltipBorder: '#cbd5e1' },
};

export const TelemetryChart = ({ history }: TelemetryChartProps) => {
  const { t, locale, theme } = usePreferences();
  const colors = CHART_COLORS[theme];

  const points: ChartPoint[] = history.map((reading) => ({
    time: new Date(reading.timestamp).toLocaleTimeString(intlLocale[locale], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }),
    temp: reading.temp,
    humidity: reading.humidity,
  }));

  return (
    <div className="rounded-2xl border border-line bg-surface p-6 shadow-lg">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-medium uppercase tracking-wider text-muted">{t.chartTitle}</h2>
        <span className="text-xs text-subtle">{t.lastReadings(points.length)}</span>
      </div>

      {points.length === 0 ? (
        <div className="flex h-72 items-center justify-center text-sm text-subtle">
          {t.waitingTelemetry} <code className="mx-1 rounded bg-line px-1.5 py-0.5">npm run simulate</code>
        </div>
      ) : (
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={points} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
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
                contentStyle={{
                  background: colors.tooltipBg,
                  border: `1px solid ${colors.tooltipBorder}`,
                  borderRadius: 8,
                }}
                labelStyle={{ color: '#64748b' }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line
                yAxisId="temp"
                type="monotone"
                dataKey="temp"
                name={t.tempSeries}
                stroke="#f97316"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
              <Line
                yAxisId="humidity"
                type="monotone"
                dataKey="humidity"
                name={t.humiditySeries}
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
