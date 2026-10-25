import { Schema, model, type HydratedDocument } from 'mongoose';
import { DEVICE_STATUSES, type DeviceStatus } from '../types/api';

export interface IDevice {
  device_id: string;
  name: string;
  status: DeviceStatus;
  updatedAt: Date;
}

export type DeviceDocument = HydratedDocument<IDevice>;

const deviceSchema = new Schema<IDevice>(
  {
    device_id: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    status: { type: String, enum: DEVICE_STATUSES, default: 'OFF' },
  },
  {
    timestamps: { createdAt: false, updatedAt: true },
    versionKey: false,
  },
);

export const Device = model<IDevice>('Device', deviceSchema);
