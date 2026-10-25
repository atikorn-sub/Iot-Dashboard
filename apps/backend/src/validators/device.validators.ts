import { DEVICE_STATUSES, type ControlPayload, type DeviceStatus, type TelemetryPayload } from '../types/api';

export type ValidationResult<T> = { ok: true; value: T } | { ok: false; errors: string[] };

type UnknownRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is UnknownRecord =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);

const isDeviceStatus = (value: unknown): value is DeviceStatus =>
  typeof value === 'string' && (DEVICE_STATUSES as readonly string[]).includes(value);

/** Plausible sensor range (DHT22 / SHT3x class sensors) — rejects corrupted frames */
const TEMP_RANGE = { min: -40, max: 125 } as const;

export const validateTelemetry = (body: unknown): ValidationResult<TelemetryPayload> => {
  if (!isRecord(body)) return { ok: false, errors: ['Body must be a JSON object'] };

  const errors: string[] = [];
  const { device_id, temp, humidity, timestamp } = body;

  if (!isNonEmptyString(device_id)) errors.push('device_id must be a non-empty string');
  if (!isFiniteNumber(temp)) errors.push('temp must be a number');
  else if (temp < TEMP_RANGE.min || temp > TEMP_RANGE.max)
    errors.push(`temp must be between ${TEMP_RANGE.min} and ${TEMP_RANGE.max} °C`);
  if (!isFiniteNumber(humidity)) errors.push('humidity must be a number');
  else if (humidity < 0 || humidity > 100) errors.push('humidity must be between 0 and 100 %');

  if (timestamp !== undefined) {
    const validType = typeof timestamp === 'string' || typeof timestamp === 'number';
    if (!validType || Number.isNaN(new Date(timestamp as string | number).getTime()))
      errors.push('timestamp must be an ISO-8601 string or epoch milliseconds');
  }

  if (errors.length > 0) return { ok: false, errors };

  return {
    ok: true,
    value: {
      device_id: (device_id as string).trim(),
      temp: temp as number,
      humidity: humidity as number,
      timestamp: timestamp as string | number | undefined,
    },
  };
};

export const validateControl = (body: unknown): ValidationResult<ControlPayload> => {
  if (!isRecord(body)) return { ok: false, errors: ['Body must be a JSON object'] };

  const errors: string[] = [];
  const { device_id, status } = body;

  if (!isNonEmptyString(device_id)) errors.push('device_id must be a non-empty string');
  if (!isDeviceStatus(status)) errors.push(`status must be one of: ${DEVICE_STATUSES.join(', ')}`);

  if (errors.length > 0) return { ok: false, errors };

  return { ok: true, value: { device_id: (device_id as string).trim(), status: status as DeviceStatus } };
};
