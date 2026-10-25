import dotenv from 'dotenv';

dotenv.config();

export interface AppConfig {
  port: number;
  corsOrigins: string[];
  mongoUri: string;
  defaultDeviceId: string;
  defaultDeviceName: string;
}

const toNumber = (value: string | undefined, fallback: number): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const config: AppConfig = {
  port: toNumber(process.env.PORT, 4000),
  corsOrigins: (process.env.CORS_ORIGIN ?? 'http://localhost:3000')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  mongoUri: process.env.MONGODB_URI ?? 'mongodb://localhost:27017/iot_dashboard',
  defaultDeviceId: process.env.DEFAULT_DEVICE_ID ?? 'esp32-node-01',
  defaultDeviceName: process.env.DEFAULT_DEVICE_NAME ?? 'ESP32 Greenhouse Node',
};
