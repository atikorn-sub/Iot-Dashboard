/**
 * Shared API contracts between the embedded board, the API and the dashboard.
 * Field names use snake_case to match a compact JSON payload an MCU firmware would emit.
 */

export const DEVICE_STATUSES = ['ON', 'OFF'] as const;
export type DeviceStatus = (typeof DEVICE_STATUSES)[number];

/** Uplink: payload sent by the board (e.g. ESP32 over HTTP) */
export interface TelemetryPayload {
  device_id: string;
  temp: number;
  humidity: number;
  /** Optional ISO-8601 or epoch ms from the board's RTC; server time is used if absent */
  timestamp?: string | number;
}

/** Control command issued from the dashboard */
export interface ControlPayload {
  device_id: string;
  status: DeviceStatus;
}

export interface DeviceDTO {
  device_id: string;
  name: string;
  status: DeviceStatus;
  updatedAt: string;
}

export interface TelemetryDTO {
  device_id: string;
  temp: number;
  humidity: number;
  timestamp: string;
}

export interface DeviceStatusResponse {
  device: DeviceDTO;
  latest: TelemetryDTO | null;
  history: TelemetryDTO[];
  /** true when the last telemetry is recent enough to consider the board online */
  online: boolean;
}

/**
 * Response to the board's telemetry POST. The desired relay state is piggybacked
 * on the reply so a polling MCU can sync actuators without a separate downlink channel.
 */
export interface TelemetryAckResponse {
  accepted: true;
  telemetry: TelemetryDTO;
  command: { status: DeviceStatus };
}

export interface ApiErrorResponse {
  error: string;
  details?: string[];
}
