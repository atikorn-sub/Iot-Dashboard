import type { DeviceStatus } from '@/types/device';

interface RelayToggleProps {
  status: DeviceStatus;
  disabled: boolean;
  onChange: (status: DeviceStatus) => void;
}

export const RelayToggle = ({ status, disabled, onChange }: RelayToggleProps) => {
  const isOn = status === 'ON';

  return (
    <div className="flex h-full flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-lg">
      <div className="flex items-center justify-between text-sm text-slate-400">
        <span className="font-medium uppercase tracking-wider">Relay / LED</span>
        <span aria-hidden>💡</span>
      </div>

      <div className="flex flex-col items-center gap-5 py-6">
        <div
          className={`h-16 w-16 rounded-full transition-all duration-300 ${
            isOn ? 'bg-amber-400 shadow-[0_0_40px_10px_rgba(251,191,36,0.45)]' : 'bg-slate-700'
          }`}
          aria-hidden
        />

        <button
          type="button"
          role="switch"
          aria-checked={isOn}
          aria-label="Toggle relay"
          disabled={disabled}
          onClick={() => onChange(isOn ? 'OFF' : 'ON')}
          className={`relative inline-flex h-10 w-20 items-center rounded-full transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 disabled:cursor-not-allowed disabled:opacity-60 ${
            isOn ? 'bg-emerald-500' : 'bg-slate-700'
          }`}
        >
          <span
            className={`inline-block h-8 w-8 transform rounded-full bg-white shadow transition-transform duration-300 ${
              isOn ? 'translate-x-11' : 'translate-x-1'
            }`}
          />
        </button>

        <span className={`text-2xl font-semibold ${isOn ? 'text-emerald-400' : 'text-slate-400'}`}>{status}</span>
      </div>

      <p className="text-center text-xs text-slate-500">
        Command is delivered to the board on its next telemetry uplink.
      </p>
    </div>
  );
};
