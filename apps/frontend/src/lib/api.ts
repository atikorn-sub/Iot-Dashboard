import type { ApiErrorResponse, ControlPayload, Device, DeviceStatusResponse } from '@/types/device';

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';
export const DEVICE_ID = process.env.NEXT_PUBLIC_DEVICE_ID ?? 'esp32-node-01';
export const POLL_INTERVAL_MS = Number(process.env.NEXT_PUBLIC_POLL_INTERVAL_MS) || 2000;

const request = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
    cache: 'no-store',
  });

  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as ApiErrorResponse | null;
    throw new Error(body?.error ?? `Request failed with HTTP ${res.status}`);
  }

  return (await res.json()) as T;
};

export const fetchDeviceStatus = (deviceId: string, history = 30): Promise<DeviceStatusResponse> =>
  request<DeviceStatusResponse>(
    `/devices/status?device_id=${encodeURIComponent(deviceId)}&history=${history}`,
  );

export const updateDeviceControl = (payload: ControlPayload): Promise<Device> =>
  request<Device>('/devices/control', { method: 'PATCH', body: JSON.stringify(payload) });
