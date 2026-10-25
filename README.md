# Mini IoT Dashboard & Device Management Platform

A full-stack MVP that monitors a (simulated) embedded sensor node in near real time and controls its relay/LED remotely.

| Layer    | Stack                                              |
| -------- | -------------------------------------------------- |
| Frontend | Next.js 15 (App Router), TypeScript, Tailwind CSS 4, Recharts |
| Backend  | Node.js, Express, TypeScript                       |
| Database | MongoDB (Mongoose)                                 |

## Architecture

```
┌──────────────────┐   POST /telemetry (temp, humidity)   ┌──────────────────┐        ┌──────────┐
│ Embedded board   │ ───────────────────────────────────▶ │  Express API     │ ─────▶ │ MongoDB  │
│ (simulator.ts /  │ ◀─────────────────────────────────── │  /api/v1/devices │ ◀───── │          │
│  ESP32 firmware) │   201 ACK + { command: { status } }  └──────────────────┘        └──────────┘
└──────────────────┘                                          ▲        │
                                       PATCH /control (ON/OFF)│        │ GET /status (polling 2s)
                                                         ┌────┴────────▼────┐
                                                         │ Next.js Dashboard│
                                                         └──────────────────┘
```

**Downlink via piggybacked ACK** — boards behind NAT or on battery typically can't hold an inbound connection.
Instead of a broker, the desired relay state is returned in the telemetry response, so the board picks up
commands on its next uplink. This is the same pattern used by many HTTP/CoAP-based IoT platforms.

## Project structure

```
apps/
├── backend/src
│   ├── config/        env + MongoDB connection
│   ├── models/        Device, TelemetryLog (Mongoose schemas)
│   ├── types/         API payload contracts
│   ├── validators/    payload validation (type guards, sensor range checks)
│   ├── services/      all database access
│   ├── controllers/   HTTP request/response handling
│   ├── routes/        /api/v1/devices
│   ├── middleware/    error handling
│   └── scripts/       simulator.ts — fake ESP32 + DHT22 node
└── frontend/src
    ├── app/           Next.js App Router entry
    ├── components/    Dashboard, SensorGauge, RelayToggle, TelemetryChart
    ├── hooks/         useDeviceStatus (polling + optimistic toggle)
    ├── lib/           API client
    └── types/         API types
```

## Getting started

Prerequisites: Node.js 20+, and MongoDB (local install, `docker compose up -d`, or a MongoDB Atlas URI).

```bash
npm install
cp apps/backend/.env.example apps/backend/.env
cp apps/frontend/.env.example apps/frontend/.env.local
npm run dev          # API on :4000, dashboard on :3000
npm run simulate     # in a second terminal — starts the virtual board
```

Open http://localhost:3000. Toggle the relay: the simulator turns the "cooling fan" on and the temperature
trend on the chart starts falling.

## API

Base URL: `http://localhost:4000/api/v1`

| Method | Path                 | Description                                  |
| ------ | -------------------- | -------------------------------------------- |
| GET    | `/devices/status`    | Device info, latest reading, history, online |
| POST   | `/devices/telemetry` | Uplink from the board                        |
| PATCH  | `/devices/control`   | Set relay state `ON` / `OFF`                 |

```bash
# Board uplink
curl -X POST http://localhost:4000/api/v1/devices/telemetry \
  -H "Content-Type: application/json" \
  -d '{"device_id":"esp32-node-01","temp":27.4,"humidity":61.2}'
# → 201 {"accepted":true,"telemetry":{...},"command":{"status":"OFF"}}

# Dashboard control
curl -X PATCH http://localhost:4000/api/v1/devices/control \
  -H "Content-Type: application/json" \
  -d '{"device_id":"esp32-node-01","status":"ON"}'

# Status (+ last 30 readings)
curl "http://localhost:4000/api/v1/devices/status?device_id=esp32-node-01&history=30"
```

Invalid payloads (wrong types, humidity outside 0–100 %, temperature outside the −40…125 °C sensor range)
are rejected with `400` and a list of `details`.

## Data model

- **Device** — `device_id` (unique), `name`, `status` (`ON`|`OFF`), `updatedAt`
- **TelemetryLog** — `device_id`, `temp`, `humidity`, `timestamp` — indexed on `{ device_id, timestamp: -1 }`
