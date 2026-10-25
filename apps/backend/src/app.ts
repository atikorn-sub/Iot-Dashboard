import cors from 'cors';
import express, { type Express } from 'express';
import mongoose from 'mongoose';
import { config } from './config/env';
import { errorHandler, notFoundHandler } from './middleware/errors';
import { deviceRouter } from './routes/device.routes';

export const createApp = (): Express => {
  const app = express();

  app.use(cors({ origin: config.corsOrigins }));
  // Telemetry frames are tiny; a small limit protects against malformed/oversized uploads
  app.use(express.json({ limit: '16kb' }));

  app.get('/health', (_req, res) => {
    res.json({ ok: true, db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' });
  });

  app.use('/api/v1/devices', deviceRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
