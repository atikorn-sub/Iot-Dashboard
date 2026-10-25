import { Device, type IDevice } from '../models/Device';
import { TelemetryLog, type ITelemetryLog } from '../models/TelemetryLog';
import type {
  DeviceDTO,
  DeviceStatus,
  DeviceStatusResponse,
  TelemetryDTO,
  TelemetryPayload,
} from '../types/api';

/** A board is considered offline if no telemetry arrived within this window */
const ONLINE_THRESHOLD_MS = 15_000;
const MAX_HISTORY = 200;

const toDeviceDTO = (device: IDevice): DeviceDTO => ({
  device_id: device.device_id,
  name: device.name,
  status: device.status,
  updatedAt: device.updatedAt.toISOString(),
});

const toTelemetryDTO = (log: ITelemetryLog): TelemetryDTO => ({
  device_id: log.device_id,
  temp: log.temp,
  humidity: log.humidity,
  timestamp: log.timestamp.toISOString(),
});

/** Idempotently registers a device (auto-provisioning on first contact) */
export const ensureDevice = async (deviceId: string, name?: string): Promise<IDevice> => {
  const device = await Device.findOneAndUpdate(
    { device_id: deviceId },
    { $setOnInsert: { device_id: deviceId, name: name ?? deviceId, status: 'OFF' } },
    { upsert: true, new: true, lean: true },
  );
  return device as IDevice;
};

export const findDevice = async (deviceId: string): Promise<IDevice | null> =>
  Device.findOne({ device_id: deviceId }).lean<IDevice>();

export const getDeviceStatus = async (
  deviceId: string,
  historyLimit: number,
): Promise<DeviceStatusResponse | null> => {
  const device = await findDevice(deviceId);
  if (!device) return null;

  const limit = Math.min(Math.max(historyLimit, 1), MAX_HISTORY);
  const logs = await TelemetryLog.find({ device_id: deviceId })
    .sort({ timestamp: -1 })
    .limit(limit)
    .lean<ITelemetryLog[]>();

  // Query newest-first for the index, return oldest-first for charting
  const history = logs.reverse().map(toTelemetryDTO);
  const latest = history.length > 0 ? history[history.length - 1] : null;
  const online = latest !== null && Date.now() - new Date(latest.timestamp).getTime() < ONLINE_THRESHOLD_MS;

  return { device: toDeviceDTO(device), latest, history, online };
};

export const recordTelemetry = async (
  payload: TelemetryPayload,
): Promise<{ telemetry: TelemetryDTO; status: DeviceStatus }> => {
  const device = await ensureDevice(payload.device_id);
  const timestamp = payload.timestamp !== undefined ? new Date(payload.timestamp) : new Date();

  const log = await TelemetryLog.create({
    device_id: payload.device_id,
    temp: payload.temp,
    humidity: payload.humidity,
    timestamp,
  });

  return { telemetry: toTelemetryDTO(log.toObject()), status: device.status };
};

export const setDeviceStatus = async (deviceId: string, status: DeviceStatus): Promise<DeviceDTO | null> => {
  const device = await Device.findOneAndUpdate(
    { device_id: deviceId },
    { $set: { status } },
    { new: true, lean: true },
  );
  return device ? toDeviceDTO(device as IDevice) : null;
};
