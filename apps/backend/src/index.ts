import { createApp } from './app';
import { connectDatabase, disconnectDatabase } from './config/db';
import { config } from './config/env';
import { ensureDevice } from './services/device.service';

const bootstrap = async (): Promise<void> => {
  await connectDatabase(config.mongoUri);
  // Make sure the dashboard has a device to show before the first telemetry frame arrives
  await ensureDevice(config.defaultDeviceId, config.defaultDeviceName);

  const server = createApp().listen(config.port, () => {
    console.log(`[api] listening on http://localhost:${config.port}`);
  });

  const shutdown = (signal: string): void => {
    console.log(`[api] ${signal} received, shutting down`);
    server.close(() => {
      void disconnectDatabase().then(() => process.exit(0));
    });
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
};

bootstrap().catch((err: unknown) => {
  console.error('[api] failed to start', err);
  process.exit(1);
});
