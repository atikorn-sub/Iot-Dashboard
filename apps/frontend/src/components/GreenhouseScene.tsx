'use client';

import { usePreferences } from '@/components/PreferencesProvider';
import type { DeviceStatus, Telemetry } from '@/types/device';

interface GreenhouseSceneProps {
  status: DeviceStatus;
  latest: Telemetry | null;
  online: boolean;
  disabled: boolean;
  onToggle: (status: DeviceStatus) => void;
}

export type ClimateLevel = 'optimal' | 'warm' | 'hot';

/** Lettuce comfort band: grows best up to ~28 °C, bolts/wilts above ~31 °C */
const CLIMATE_THRESHOLDS = { warm: 28, hot: 31 } as const;

export const getClimateLevel = (temp: number): ClimateLevel => {
  if (temp > CLIMATE_THRESHOLDS.hot) return 'hot';
  if (temp > CLIMATE_THRESHOLDS.warm) return 'warm';
  return 'optimal';
};

const CLIMATE_COLORS: Record<ClimateLevel, { leaf: string; leafDark: string; label: string }> = {
  optimal: { leaf: '#4ade80', leafDark: '#16a34a', label: '#4ade80' },
  warm: { leaf: '#a3e635', leafDark: '#65a30d', label: '#fbbf24' },
  hot: { leaf: '#d9f99d', leafDark: '#a3a316', label: '#f87171' },
};

const FAN_HUB = { x: 470, y: 190 };
const FRONT_ROW = [130, 190, 250, 310, 370, 430];
const BACK_ROW = [160, 212, 264, 316, 368, 420];
const MULLIONS = [
  { x: 143, top: 123 },
  { x: 216, top: 96 },
  { x: 288, top: 70 },
  { x: 360, top: 96 },
  { x: 433, top: 123 },
];
const STARS = [
  [40, 30],
  [120, 50],
  [200, 22],
  [380, 34],
  [450, 60],
  [560, 28],
];

interface LettuceProps {
  x: number;
  baseY: number;
  scale: number;
  leaf: string;
  leafDark: string;
  swaying: boolean;
  delay: number;
}

const Lettuce = ({ x, baseY, scale, leaf, leafDark, swaying, delay }: LettuceProps) => (
  <g transform={`translate(${x} ${baseY}) scale(${scale})`}>
    <g className={swaying ? 'plant-sway' : undefined} style={{ animationDelay: `${delay}s` }}>
      <ellipse cx="-11" cy="-7" rx="10" ry="7" fill={leafDark} transform="rotate(-25 -11 -7)" />
      <ellipse cx="11" cy="-7" rx="10" ry="7" fill={leafDark} transform="rotate(25 11 -7)" />
      <ellipse cx="0" cy="-11" rx="12" ry="10" fill={leaf} className="transition-colors duration-700" />
      <ellipse cx="0" cy="-19" rx="7" ry="8" fill={leaf} className="transition-colors duration-700" />
      <ellipse cx="0" cy="-13" rx="4" ry="4" fill="#f0fdf4" opacity="0.5" />
    </g>
  </g>
);

/**
 * Illustrated context for the telemetry: a lettuce greenhouse whose exhaust fan is
 * the relay load. Plant colour reflects the climate band, the fan and airflow follow
 * the relay, and the wall-mounted node blinks on every uplink.
 */
export const GreenhouseScene = ({ status, latest, online, disabled, onToggle }: GreenhouseSceneProps) => {
  const { t, theme } = usePreferences();
  const isOn = status === 'ON';
  const night = theme === 'dark';
  const climate = latest ? getClimateLevel(latest.temp) : null;
  const colors = CLIMATE_COLORS[climate ?? 'optimal'];
  const frameKey = latest?.timestamp ?? 'none';
  const showUplink = online && latest !== null;

  const handleToggle = (): void => {
    if (!disabled) onToggle(isOn ? 'OFF' : 'ON');
  };

  return (
    <svg viewBox="0 0 576 352" className="h-auto w-full" role="img" aria-label={t.sceneAria}>
      <defs>
        <linearGradient id="gh-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={night ? '#0b1530' : '#7dd3fc'} />
          <stop offset="100%" stopColor={night ? '#1e293b' : '#e0f2fe'} />
        </linearGradient>
        <filter id="gh-glow" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* ── Sky ──────────────────────────────────────── */}
      <rect x="0" y="0" width="576" height="352" rx="12" fill="url(#gh-sky)" />
      {night ? (
        <>
          {STARS.map(([x, y]) => (
            <circle key={`${x}-${y}`} cx={x} cy={y} r="1.5" fill="#e2e8f0" opacity="0.8" />
          ))}
          <circle cx="520" cy="46" r="18" fill="#f8fafc" />
          <circle cx="528" cy="40" r="16" fill="#0f1b38" />
        </>
      ) : (
        <g filter="url(#gh-glow)">
          <circle cx="520" cy="46" r={climate === 'hot' ? 24 : 18} fill="#facc15" className="transition-all duration-700" />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
            <line
              key={angle}
              x1="520"
              y1="16"
              x2="520"
              y2="8"
              stroke="#facc15"
              strokeWidth="3"
              strokeLinecap="round"
              transform={`rotate(${angle} 520 46)`}
            />
          ))}
        </g>
      )}

      {/* ── Ground ───────────────────────────────────── */}
      <rect x="0" y="300" width="576" height="52" fill={night ? '#1a2e05' : '#84cc16'} />
      <rect x="0" y="300" width="576" height="6" fill={night ? '#365314' : '#65a30d'} />

      {/* ── Greenhouse shell ─────────────────────────── */}
      <polygon
        points="70,300 70,150 288,70 506,150 506,300"
        fill={night ? 'rgba(148,163,184,0.12)' : 'rgba(255,255,255,0.4)'}
        stroke={night ? '#94a3b8' : '#f8fafc'}
        strokeWidth="5"
        strokeLinejoin="round"
      />
      <g stroke={night ? '#64748b' : '#f1f5f9'} strokeWidth="2">
        {MULLIONS.map(({ x, top }) => (
          <line key={x} x1={x} y1={top} x2={x} y2="300" />
        ))}
        <line x1="70" y1="150" x2="506" y2="150" />
      </g>

      {/* Climate display hanging from the ridge */}
      <line x1="288" y1="72" x2="288" y2="104" stroke="#64748b" strokeWidth="1.5" />
      <rect x="226" y="104" width="124" height="44" rx="6" fill="#0f172a" stroke="#334155" />
      <text x="288" y="122" textAnchor="middle" fontSize="12" fontFamily="ui-monospace, monospace" fill="#67e8f9">
        {latest ? `${latest.temp.toFixed(1)}°C · ${latest.humidity.toFixed(0)}%` : '--.-°C · --%'}
      </text>
      <text x="288" y="139" textAnchor="middle" fontSize="10" fontWeight="700" fill={climate ? colors.label : '#64748b'}>
        {climate ? t.climate[climate] : t.noSignal}
      </text>

      {/* Heat shimmer when it is too hot and the fan is off */}
      {climate === 'hot' && !isOn && (
        <g fill="none" stroke="#fb923c" strokeWidth="2" strokeLinecap="round" opacity="0.7">
          {[180, 288, 396].map((x, i) => (
            <path
              key={x}
              className="heat-wave"
              style={{ animationDelay: `${i * 0.4}s` }}
              d={`M${x} 220 q6 -8 0 -16 q-6 -8 0 -16 q6 -8 0 -16`}
            />
          ))}
        </g>
      )}

      {/* ── Planter beds with lettuce ────────────────── */}
      <rect x="130" y="240" width="316" height="12" rx="3" fill={night ? '#57301a' : '#92400e'} />
      {BACK_ROW.map((x, i) => (
        <Lettuce key={x} x={x} baseY={242} scale={0.8} leaf={colors.leaf} leafDark={colors.leafDark} swaying={isOn} delay={i * 0.15} />
      ))}
      <rect x="100" y="278" width="376" height="20" rx="3" fill={night ? '#6b3a1f' : '#a16207'} />
      {FRONT_ROW.map((x, i) => (
        <Lettuce key={x} x={x} baseY={281} scale={1} leaf={colors.leaf} leafDark={colors.leafDark} swaying={isOn} delay={i * 0.12} />
      ))}

      {/* ── Wall-mounted IoT node (ESP32 + DHT22) ────── */}
      {showUplink && (
        <g key={`wifi-${frameKey}`} fill="none" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round">
          <path className="wifi-wave" style={{ animationDelay: '0.1s' }} d="M124 150 Q130 145 136 150" />
          <path className="wifi-wave" style={{ animationDelay: '0.25s' }} d="M119 145 Q130 136 141 145" />
          <path className="wifi-wave" style={{ animationDelay: '0.4s' }} d="M114 140 Q130 127 146 140" />
        </g>
      )}
      <line x1="130" y1="168" x2="130" y2="154" stroke="#cbd5e1" strokeWidth="2" />
      <rect x="92" y="168" width="46" height="32" rx="4" fill="#1e3a5f" stroke="#38bdf8" strokeWidth="1" />
      <text x="115" y="188" textAnchor="middle" fontSize="8" fontWeight="700" fill="#e2e8f0">ESP32</text>
      <circle cx="99" cy="174" r="2.5" fill="#1e3a8a" />
      {showUplink && (
        <circle key={`led-${frameKey}`} className="led-blink" style={{ animationDelay: '0s' }} cx="99" cy="174" r="2.5" fill="#60a5fa" filter="url(#gh-glow)" />
      )}
      <rect x="108" y="204" width="14" height="18" rx="2" fill="#f8fafc" stroke="#cbd5e1" />
      <text x="115" y="232" textAnchor="middle" fontSize="6" fill={night ? '#94a3b8' : '#475569'}>DHT22</text>

      {/* ── Exhaust fan = relay load (clickable) ──────── */}
      <g
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label={t.boardAria(status)}
        aria-disabled={disabled}
        onClick={handleToggle}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleToggle();
          }
        }}
        className={`outline-none ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'} [&:hover>.fan-housing]:stroke-sky-400 [&:focus-visible>.fan-housing]:stroke-sky-400`}
      >
        <rect className="fan-housing transition-colors" x="440" y="160" width="60" height="60" rx="8" fill="#334155" stroke="#475569" strokeWidth="3" />
        <circle cx={FAN_HUB.x} cy={FAN_HUB.y} r="25" fill="#0f172a" />
        <g
          className={isOn ? 'fan-spinning' : undefined}
          style={{ transformOrigin: `${FAN_HUB.x}px ${FAN_HUB.y}px` }}
        >
          {[0, 120, 240].map((angle) => (
            <ellipse
              key={angle}
              cx={FAN_HUB.x}
              cy={FAN_HUB.y - 12}
              rx="6"
              ry="11"
              fill={isOn ? '#7dd3fc' : '#64748b'}
              transform={`rotate(${angle} ${FAN_HUB.x} ${FAN_HUB.y})`}
            />
          ))}
        </g>
        <circle cx={FAN_HUB.x} cy={FAN_HUB.y} r="5" fill="#475569" />
        <circle cx="494" cy="166" r="3" fill={isOn ? '#4ade80' : '#450a0a'} filter={isOn ? 'url(#gh-glow)' : undefined} />
      </g>

      {/* Hot air pushed out through the wall when the fan runs */}
      {isOn && (
        <g fill="none" stroke={night ? '#7dd3fc' : '#0ea5e9'} strokeWidth="2.5" strokeLinecap="round" opacity="0.8">
          {[174, 190, 206].map((y, i) => (
            <path key={y} className="airflow" style={{ animationDelay: `${i * 0.2}s` }} d={`M508 ${y} q14 -6 28 0 t28 0`} />
          ))}
        </g>
      )}
    </svg>
  );
};
