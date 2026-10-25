/**
 * Embedded board simulator.
 *
 * Mimics the firmware loop of an ESP32 + DHT22 node:
 *   1. read sensors  2. POST telemetry  3. apply the relay command from the ACK
 * When the relay (a cooling fan) is ON the temperature drifts down, so toggling
 * the switch on the dashboard has a visible effect on the chart.
 */
import dotenv from 'dotenv';
import type { DeviceStatus, TelemetryAckResponse, TelemetryPayload } from '../types/api';

dotenv.config();

const API_URL = process.env.SIMULATOR_API_URL ?? 'http://localhost:4000/api/v1';
const DEVICE_ID = process.env.DEFAULT_DEVICE_ID ?? 'esp32-node-01';
const INTERVAL_MS = Number(process.env.SIMULATOR_INTERVAL_MS) || 3000;

interface SensorState {
  temp: number;
  humidity: number;
  relay: DeviceStatus;
}

const state: SensorState = { temp: 28, humidity: 60, relay: 'OFF' };

const clamp = (value: number, min: number, max: number): number => Math.min(Math.max(value, min), max);
const round1 = (value: number): number => Math.round(value * 10) / 10;
const noise = (amplitude: number): number => (Math.random() * 2 - 1) * amplitude;

/** Steady-state readings the room settles at with the fan off / on */
const EQUILIBRIUM: Record<DeviceStatus, { temp: number; humidity: number }> = {
  OFF: { temp: 33, humidity: 70 },
  ON: { temp: 25, humidity: 52 },
};
/** Fraction of the gap to equilibrium closed each cycle (first-order thermal lag) */
const SETTLE_RATE = 0.08;

const readSensors = (): Pick<TelemetryPayload, 'temp' | 'humidity'> => {
  const target = EQUILIBRIUM[state.relay];
  state.temp = clamp(state.temp + (target.temp - state.temp) * SETTLE_RATE + noise(0.15), 18, 40);
  state.humidity = clamp(state.humidity + (target.humidity - state.humidity) * SETTLE_RATE + noise(0.5), 30, 90);
  return { temp: round1(state.temp), humidity: round1(state.humidity) };
};

const sendTelemetry = async (): Promise<void> => {
  const payload: TelemetryPayload = { device_id: DEVICE_ID, ...readSensors(), timestamp: Date.now() };

  try {
    const res = await fetch(`${API_URL}/devices/telemetry`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      console.warn(`[sim] uplink rejected: HTTP ${res.status} ${await res.text()}`);
      return;
    }

    const ack = (await res.json()) as TelemetryAckResponse;
    if (ack.command.status !== state.relay) {
      console.log(`[sim] relay ${state.relay} -> ${ack.command.status}`);
      state.relay = ack.command.status;
    }
    console.log(`[sim] ${DEVICE_ID} temp=${payload.temp}°C humidity=${payload.humidity}% relay=${state.relay}`);
  } catch (err) {
    console.warn(`[sim] uplink failed (${(err as Error).message}); retrying next cycle`);
  }
};

console.log(`[sim] starting ${DEVICE_ID} -> ${API_URL} every ${INTERVAL_MS}ms`);
void sendTelemetry();
setInterval(() => void sendTelemetry(), INTERVAL_MS);
