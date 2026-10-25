import { Router } from 'express';
import { getStatus, patchControl, postTelemetry } from '../controllers/device.controller';
import { asyncHandler } from '../middleware/errors';

export const deviceRouter = Router();

deviceRouter.get('/status', asyncHandler(getStatus));
deviceRouter.post('/telemetry', asyncHandler(postTelemetry));
deviceRouter.patch('/control', asyncHandler(patchControl));
