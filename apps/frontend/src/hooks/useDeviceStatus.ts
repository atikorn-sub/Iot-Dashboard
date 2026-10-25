'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchDeviceStatus, updateDeviceControl } from '@/lib/api';
import type { DeviceStatus, DeviceStatusResponse } from '@/types/device';

interface UseDeviceStatusResult {
  data: DeviceStatusResponse | null;
  error: string | null;
  loading: boolean;
  toggling: boolean;
  lastPolledAt: Date | null;
  setStatus: (status: DeviceStatus) => Promise<void>;
}

/**
 * Polls the device status endpoint on a fixed interval (REST polling keeps the MVP
 * free of WebSocket infrastructure) and exposes an optimistic relay toggle.
 */
export const useDeviceStatus = (deviceId: string, intervalMs: number): UseDeviceStatusResult => {
  const [data, setData] = useState<DeviceStatusResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [lastPolledAt, setLastPolledAt] = useState<Date | null>(null);
  // Skip poll results while a control request is in flight so the optimistic state doesn't flicker
  const togglingRef = useRef(false);

  const poll = useCallback(async (): Promise<void> => {
    try {
      const next = await fetchDeviceStatus(deviceId);
      if (!togglingRef.current) setData(next);
      setError(null);
      setLastPolledAt(new Date());
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [deviceId]);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    let cancelled = false;

    const loop = async (): Promise<void> => {
      await poll();
      if (!cancelled) timer = setTimeout(() => void loop(), intervalMs);
    };
    void loop();

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [poll, intervalMs]);

  const setStatus = useCallback(
    async (status: DeviceStatus): Promise<void> => {
      const previous = data;
      togglingRef.current = true;
      setToggling(true);
      setData((current) => (current ? { ...current, device: { ...current.device, status } } : current));

      try {
        const device = await updateDeviceControl({ device_id: deviceId, status });
        setData((current) => (current ? { ...current, device } : current));
        setError(null);
      } catch (err) {
        setData(previous);
        setError((err as Error).message);
      } finally {
        togglingRef.current = false;
        setToggling(false);
      }
    },
    [data, deviceId],
  );

  return { data, error, loading, toggling, lastPolledAt, setStatus };
};
