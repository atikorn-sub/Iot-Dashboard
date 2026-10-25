// Mirrors apps/backend/src/types/api.ts — the API contract consumed by the dashboard

export type DeviceStatus = 'ON' | 'OFF';

export interface Device {
  device_id: string;
  name: string;
  status: DeviceStatus;
  updatedAt: string;
}

export interface Telemetry {
  device_id: string;
  temp: number;
  humidity: number;
  timestamp: string;
}

export interface DeviceStatusResponse {
  device: Device;
  latest: Telemetry | null;
  history: Telemetry[];
  online: boolean;
}

export interface ControlPayload {
  device_id: string;
  status: DeviceStatus;
}

export interface ApiErrorResponse {
  error: string;
  details?: string[];
}
