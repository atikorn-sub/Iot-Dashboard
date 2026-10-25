'use client';

import { useEffect, useRef, useState } from 'react';
import { usePreferences } from '@/components/PreferencesProvider';
import type { DeviceStatus, Telemetry } from '@/types/device';

interface BoardSimulationProps {
  status: DeviceStatus;
  latest: Telemetry | null;
  online: boolean;
  disabled: boolean;
  onToggle: (status: DeviceStatus) => void;
}

// Relay armature pivot and fan hub — rotation origins in SVG user units
const ARMATURE_PIVOT = { x: 520, y: 186 };
const FAN_HUB = { x: 530, y: 320 };

const HEADER_PINS = Array.from({ length: 15 }, (_, i) => 100 + i * 12);
const GRILLE_ROWS = [110, 118, 126, 134, 142, 150, 158];
const GRILLE_COLS = [42, 50, 58, 66, 74, 82];
const ANTENNA_PATH =
  'M270 112 h8 v-12 h8 v12 h8 v-12 h8 v12 h8 v-12 h8 v12 h8 v-12 h8 v12 h8 v-12 h8 v12 h8 v-12 h8 v12';

/**
 * Animated SVG of the physical node: DHT22 → ESP32 → relay module → fan.
 * Every new telemetry frame replays the sensor-read / Wi-Fi uplink animation,
 * and the relay armature + fan follow the commanded device state.
 */
export const BoardSimulation = ({ status, latest, online, disabled, onToggle }: BoardSimulationProps) => {
  const { t } = usePreferences();
  const isOn = status === 'ON';
  // Keyed by timestamp so the one-shot animations restart on each uplink
  const frameKey = latest?.timestamp ?? 'none';
  const showUplink = online && latest !== null;

  const [clickKey, setClickKey] = useState(0);
  const previousStatus = useRef<DeviceStatus>(status);
  useEffect(() => {
    if (previousStatus.current !== status) setClickKey((k) => k + 1);
    previousStatus.current = status;
  }, [status]);

  const handleToggle = (): void => {
    if (!disabled) onToggle(isOn ? 'OFF' : 'ON');
  };

  return (
    <svg viewBox="22 12 576 352" className="h-auto w-full" role="img" aria-label="Simulated ESP32 board">
      <defs>
        <linearGradient id="shield" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#e2e8f0" />
          <stop offset="100%" stopColor="#94a3b8" />
        </linearGradient>
        <filter id="glow" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* ── Wi-Fi uplink ─────────────────────────────── */}
      {showUplink ? (
        <g key={`wifi-${frameKey}`} fill="none" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round">
          <path className="wifi-wave" style={{ animationDelay: '0.7s' }} d="M308 80 Q320 70 332 80" />
          <path className="wifi-wave" style={{ animationDelay: '0.85s' }} d="M298 70 Q320 54 342 70" />
          <path className="wifi-wave" style={{ animationDelay: '1s' }} d="M288 60 Q320 38 352 60" />
          <text className="wifi-wave" style={{ animationDelay: '0.85s' }} x="320" y="24" textAnchor="middle" fontSize="11" fill="#38bdf8" stroke="none">
            POST /telemetry ↑
          </text>
        </g>
      ) : (
        <text x="320" y="64" textAnchor="middle" fontSize="11" fill="#f43f5e">
          {t.noSignal}
        </text>
      )}

      {/* ── DHT22 sensor ─────────────────────────────── */}
      {latest && (
        <text x="63" y="90" textAnchor="middle" fontSize="11" fill="#fb923c" className="tabular-nums">
          {latest.temp.toFixed(1)}°C
        </text>
      )}
      <rect x="34" y="100" width="58" height="90" rx="6" fill="#f1f5f9" />
      {GRILLE_ROWS.map((y) =>
        GRILLE_COLS.map((x) => <rect key={`${x}-${y}`} x={x} y={y} width="5" height="5" rx="1" fill="#cbd5e1" />),
      )}
      <text x="63" y="180" textAnchor="middle" fontSize="9" fontWeight="600" fill="#475569">
        DHT22
      </text>
      {[50, 63, 76].map((x) => (
        <line key={x} x1={x} y1="190" x2={x} y2="200" stroke="#94a3b8" strokeWidth="2" />
      ))}

      {/* Sensor → ESP32 wires (VCC, DATA, GND) */}
      <g fill="none" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M50 200 V256 H186" stroke="#ef4444" />
        <path d="M63 200 V244 H186" stroke="#b45309" />
        <path d="M76 200 V232 H186" stroke="#475569" />
      </g>
      {showUplink && (
        <path
          key={`data-${frameKey}`}
          className="data-pulse"
          d="M63 200 V244 H186"
          pathLength={100}
          fill="none"
          stroke="#fde047"
          strokeWidth="4"
          strokeLinecap="round"
          filter="url(#glow)"
        />
      )}

      {/* ── ESP32 dev board ──────────────────────────── */}
      <rect x="182" y="86" width="256" height="200" rx="10" fill="#0f2a4a" stroke="#1e4976" strokeWidth="2" />
      {HEADER_PINS.map((y) => (
        <g key={y}>
          <rect x="186" y={y - 3} width="8" height="6" rx="1" fill="#d4a017" />
          <rect x="426" y={y - 3} width="8" height="6" rx="1" fill="#d4a017" />
        </g>
      ))}

      <rect x="262" y="94" width="116" height="24" fill="#14365e" />
      <path d={ANTENNA_PATH} fill="none" stroke="#d4a017" strokeWidth="2" />
      <rect x="268" y="122" width="104" height="80" rx="3" fill="url(#shield)" />
      <text x="320" y="160" textAnchor="middle" fontSize="9" fontWeight="700" fill="#334155">
        ESP32-WROOM-32
      </text>
      <text x="320" y="174" textAnchor="middle" fontSize="7" fill="#475569">
        Wi-Fi · BLE · 240 MHz
      </text>

      {/* OLED shows what the firmware just read */}
      <rect x="200" y="214" width="116" height="56" rx="3" fill="#000" stroke="#334155" />
      <g fontFamily="ui-monospace, monospace" fontSize="10" fill="#67e8f9">
        {latest ? (
          <>
            <text x="208" y="231">T: {latest.temp.toFixed(1)} C</text>
            <text x="208" y="246">H: {latest.humidity.toFixed(1)} %</text>
            <text x="208" y="261">RLY: {status}</text>
          </>
        ) : (
          <text x="208" y="246">Waiting...</text>
        )}
      </g>

      {/* Power + GPIO2 status LEDs */}
      <circle cx="344" cy="226" r="4" fill={online ? '#ef4444' : '#450a0a'} filter={online ? 'url(#glow)' : undefined} />
      <circle cx="364" cy="226" r="4" fill="#1e3a8a" />
      {showUplink && (
        <circle key={`led-${frameKey}`} className="led-blink" cx="364" cy="226" r="4" fill="#60a5fa" filter="url(#glow)" />
      )}
      <text x="344" y="240" textAnchor="middle" fontSize="6" fill="#94a3b8">PWR</text>
      <text x="364" y="240" textAnchor="middle" fontSize="6" fill="#94a3b8">IO2</text>

      <rect x="334" y="254" width="14" height="10" rx="2" fill="#1e293b" stroke="#475569" />
      <rect x="366" y="254" width="14" height="10" rx="2" fill="#1e293b" stroke="#475569" />
      <text x="341" y="274" textAnchor="middle" fontSize="6" fill="#94a3b8">EN</text>
      <text x="373" y="274" textAnchor="middle" fontSize="6" fill="#94a3b8">BOOT</text>
      <rect x="290" y="280" width="40" height="12" rx="2" fill="#cbd5e1" />

      {/* ESP32 → relay wires (VCC, GND, IN) */}
      <g fill="none" strokeWidth="3" strokeLinecap="round">
        <path d="M434 148 L470 152" stroke="#ef4444" />
        <path d="M434 160 L470 164" stroke="#475569" />
        <path
          d="M434 172 L470 176"
          stroke={isOn ? '#fbbf24' : '#78350f'}
          filter={isOn ? 'url(#glow)' : undefined}
          className="transition-colors duration-150"
        />
      </g>

      {/* ── Relay module (clickable) ─────────────────── */}
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
        className={`outline-none ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'} [&:hover>.relay-pcb]:stroke-sky-400 [&:focus-visible>.relay-pcb]:stroke-sky-400`}
      >
        <rect className="relay-pcb transition-colors" x="470" y="110" width="120" height="130" rx="6" fill="#1e40af" stroke="#1e3a8a" strokeWidth="2" />
        <text x="476" y="154" fontSize="6" fill="#bfdbfe">VCC</text>
        <text x="476" y="166" fontSize="6" fill="#bfdbfe">GND</text>
        <text x="476" y="178" fontSize="6" fill="#bfdbfe">IN</text>

        {/* Relay cube with a cut-away window to show the mechanism */}
        <rect x="490" y="122" width="76" height="76" rx="3" fill="#2563eb" />
        <text x="528" y="132" textAnchor="middle" fontSize="6" fill="#dbeafe">SRD-05VDC-SL-C</text>
        <rect x="494" y="138" width="68" height="56" rx="3" fill="#0b1220" opacity="0.9" />

        <rect
          x="498"
          y="148"
          width="16"
          height="36"
          rx="2"
          fill={isOn ? '#f97316' : '#b45309'}
          filter={isOn ? 'url(#glow)' : undefined}
          className="transition-colors duration-150"
        />
        {[154, 160, 166, 172, 178].map((y) => (
          <line key={y} x1="498" y1={y} x2="514" y2={y} stroke="#78350f" strokeWidth="1" />
        ))}

        <circle cx="549" cy="146" r="3" fill="#facc15" />
        <circle cx="558" cy="160" r="3" fill="#facc15" />
        <text x="549" y="143" textAnchor="middle" fontSize="5" fill="#94a3b8">NC</text>
        <text x="558" y="170" textAnchor="middle" fontSize="5" fill="#94a3b8">NO</text>

        <g
          className="relay-armature"
          style={{
            transformOrigin: `${ARMATURE_PIVOT.x}px ${ARMATURE_PIVOT.y}px`,
            transform: `rotate(${isOn ? 16 : 0}deg)`,
          }}
        >
          <line x1={ARMATURE_PIVOT.x} y1={ARMATURE_PIVOT.y} x2="548" y2="148" stroke="#e2e8f0" strokeWidth="3" strokeLinecap="round" />
        </g>
        <circle cx={ARMATURE_PIVOT.x} cy={ARMATURE_PIVOT.y} r="3" fill="#94a3b8" />

        <circle cx="578" cy="126" r="4" fill={isOn ? '#ef4444' : '#450a0a'} filter={isOn ? 'url(#glow)' : undefined} />

        {/* Screw terminal */}
        <text x="502" y="210" textAnchor="middle" fontSize="6" fill="#bfdbfe">NO</text>
        <text x="530" y="210" textAnchor="middle" fontSize="6" fill="#bfdbfe">COM</text>
        <text x="558" y="210" textAnchor="middle" fontSize="6" fill="#bfdbfe">NC</text>
        <rect x="488" y="214" width="84" height="22" rx="2" fill="#16a34a" />
        {[502, 530, 558].map((x) => (
          <g key={x}>
            <circle cx={x} cy="225" r="6" fill="#cbd5e1" />
            <line x1={x - 4} y1="225" x2={x + 4} y2="225" stroke="#475569" strokeWidth="1.5" />
          </g>
        ))}
      </g>

      {clickKey > 0 && (
        <text key={clickKey} className="click-pop" x="530" y="104" textAnchor="middle" fontSize="12" fontWeight="700" fill="#fbbf24">
          *click*
        </text>
      )}

      {/* Relay → fan load wires: current flows only when the contact is closed */}
      <g fill="none" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M502 236 V266 H520 V292" stroke="#475569" />
        <path d="M530 236 V256 H540 V292" stroke="#475569" />
        {isOn && (
          <>
            <path className="current-flow" d="M502 236 V266 H520 V292" stroke="#4ade80" />
            <path className="current-flow" d="M530 236 V256 H540 V292" stroke="#4ade80" />
          </>
        )}
      </g>

      {/* ── Fan (relay load) ─────────────────────────── */}
      <rect x="496" y="292" width="68" height="68" rx="10" fill="#1e293b" stroke="#334155" />
      <circle cx={FAN_HUB.x} cy={FAN_HUB.y + 6} r="28" fill="#0f172a" />
      <g
        className={isOn ? 'fan-rotor fan-spinning' : 'fan-rotor'}
        style={{ transformOrigin: `${FAN_HUB.x}px ${FAN_HUB.y + 6}px` }}
      >
        {[0, 120, 240].map((angle) => (
          <ellipse
            key={angle}
            cx={FAN_HUB.x}
            cy={FAN_HUB.y - 8}
            rx="7"
            ry="13"
            fill={isOn ? '#7dd3fc' : '#64748b'}
            transform={`rotate(${angle} ${FAN_HUB.x} ${FAN_HUB.y + 6})`}
          />
        ))}
      </g>
      <circle cx={FAN_HUB.x} cy={FAN_HUB.y + 6} r="6" fill="#334155" />
      <text x="488" y="322" textAnchor="end" fontSize="10" fontWeight="600" fill={isOn ? '#7dd3fc' : '#64748b'}>
        FAN
      </text>
      <text x="488" y="334" textAnchor="end" fontSize="7" fill="#64748b">
        12V DC
      </text>
    </svg>
  );
};
