import type { Request, Response } from 'express';
import { config } from '../config/env';
import { HttpError } from '../middleware/errors';
import * as deviceService from '../services/device.service';
import type { DeviceDTO, DeviceStatusResponse, TelemetryAckResponse } from '../types/api';
import { validateControl, validateTelemetry } from '../validators/device.validators';

const DEFAULT_HISTORY = 30;

interface StatusQuery {
  device_id?: string;
  history?: string;
}

/** GET /api/v1/devices/status?device_id=&history= */
export const getStatus = async (
  req: Request<unknown, DeviceStatusResponse, unknown, StatusQuery>,
  res: Response<DeviceStatusResponse>,
): Promise<void> => {
  const deviceId = req.query.device_id?.trim() || config.defaultDeviceId;
  const historyLimit = Number(req.query.history) || DEFAULT_HISTORY;

  const status = await deviceService.getDeviceStatus(deviceId, historyLimit);
  if (!status) throw new HttpError(404, `Device '${deviceId}' not found`);

  res.json(status);
};

/** POST /api/v1/devices/telemetry — uplink from the (simulated) embedded board */
export const postTelemetry = async (req: Request, res: Response<TelemetryAckResponse>): Promise<void> => {
  const result = validateTelemetry(req.body);
  if (!result.ok) throw new HttpError(400, 'Invalid telemetry payload', result.errors);

  const { telemetry, status } = await deviceService.recordTelemetry(result.value);
  res.status(201).json({ accepted: true, telemetry, command: { status } });
};

/** PATCH /api/v1/devices/control — set relay/LED state from the dashboard */
export const patchControl = async (req: Request, res: Response<DeviceDTO>): Promise<void> => {
  const result = validateControl(req.body);
  if (!result.ok) throw new HttpError(400, 'Invalid control payload', result.errors);

  const device = await deviceService.setDeviceStatus(result.value.device_id, result.value.status);
  if (!device) throw new HttpError(404, `Device '${result.value.device_id}' not found`);

  res.json(device);
};
