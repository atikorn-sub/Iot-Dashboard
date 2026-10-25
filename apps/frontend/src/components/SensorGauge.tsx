interface SensorGaugeProps {
  label: string;
  value: number | null;
  unit: string;
  min: number;
  max: number;
  /** Tailwind stroke color class for the value arc */
  colorClass: string;
  icon: string;
}

const RADIUS = 52;
const ARC_DEGREES = 270;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const ARC_LENGTH = (ARC_DEGREES / 360) * CIRCUMFERENCE;

/** Lightweight SVG radial gauge — no chart dependency needed for a single value */
export const SensorGauge = ({ label, value, unit, min, max, colorClass, icon }: SensorGaugeProps) => {
  const ratio = value === null ? 0 : Math.min(Math.max((value - min) / (max - min), 0), 1);
  const filled = ratio * ARC_LENGTH;

  return (
    <div className="flex flex-col items-center rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-lg">
      <div className="mb-2 flex w-full items-center justify-between text-sm text-slate-400">
        <span className="font-medium uppercase tracking-wider">{label}</span>
        <span aria-hidden>{icon}</span>
      </div>

      <div className="relative h-40 w-40">
        <svg viewBox="0 0 120 120" className="h-full w-full rotate-[135deg]">
          <circle
            cx="60"
            cy="60"
            r={RADIUS}
            fill="none"
            strokeWidth="10"
            strokeLinecap="round"
            className="stroke-slate-800"
            strokeDasharray={`${ARC_LENGTH} ${CIRCUMFERENCE}`}
          />
          <circle
            cx="60"
            cy="60"
            r={RADIUS}
            fill="none"
            strokeWidth="10"
            strokeLinecap="round"
            className={`${colorClass} transition-all duration-700 ease-out`}
            strokeDasharray={`${filled} ${CIRCUMFERENCE}`}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-semibold tabular-nums text-slate-100">
            {value === null ? '--' : value.toFixed(1)}
          </span>
          <span className="text-sm text-slate-400">{unit}</span>
        </div>
      </div>

      <div className="mt-1 flex w-36 justify-between text-xs text-slate-500">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
};
