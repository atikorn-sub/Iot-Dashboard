import { Schema, model, type HydratedDocument } from 'mongoose';

export interface ITelemetryLog {
  device_id: string;
  temp: number;
  humidity: number;
  timestamp: Date;
}

export type TelemetryLogDocument = HydratedDocument<ITelemetryLog>;

const telemetryLogSchema = new Schema<ITelemetryLog>(
  {
    device_id: { type: String, required: true, trim: true },
    temp: { type: Number, required: true },
    humidity: { type: Number, required: true, min: 0, max: 100 },
    timestamp: { type: Date, required: true, default: () => new Date() },
  },
  { versionKey: false },
);

// Time-series access pattern: "latest N readings for a device"
telemetryLogSchema.index({ device_id: 1, timestamp: -1 });

export const TelemetryLog = model<ITelemetryLog>('TelemetryLog', telemetryLogSchema);
