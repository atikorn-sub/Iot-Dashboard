# Project Context: Mini IoT Dashboard & Device Management Platform (MVP)

## Project Overview
This project is a Minimal Viable Product (MVP) Full Stack Web Application designed to showcase to **Gravitech Thai (Thailand) Co., Ltd.** 
The platform demonstrates real-time IoT device monitoring (simulated sensor data) and device control, bridging web applications with embedded systems concepts.

Target Tech Stack strictly requested by employer:
- **Frontend:** Next.js (App Router), TypeScript, Tailwind CSS
- **Backend:** Node.js, Express, TypeScript
- **Database:** MongoDB (Mongoose)
- **Version Control:** Git / GitHub

---

## AI Assistant Guidelines & Authority (Permissions Matrix)

### 1. File & Architecture Permissions
- **ALLOWED (Full Write & Create Access):**
  - Project code files within `/src` or `/apps` (Frontend and Backend components, API routes, models, utilities).
  - Component styling using Tailwind CSS inline classes.
  - Setup scripts, environment variable templates (`.env.example`), and standard configurations (`tsconfig.json`, `package.json`).
- **RESTRICTED (Ask Before Modifying):**
  - Database schema changes that wipe existing data structures.
  - Core architectural decisions outside the scope of this MVP.
- **FORBIDDEN (Do Not Create or Install):**
  - Overly complex microservice architectures or external message brokers (e.g., Kafka, RabbitMQ). Use simple WebSocket or standard REST polling for MVP velocity.
  - Unnecessary third-party libraries that slow down development speed.

### 2. Implementation Scope Constraints (Strict MVP)
Because time is critical, the AI must strictly adhere to the following minimal scope:

1. **Frontend (Next.js + TypeScript):**
   - Single-page Dashboard UI with clean UI (Tailwind CSS).
   - Real-time/polling visual elements: 
     - Temperature & Humidity gauge/card.
     - LED / Relay Status Toggle Button (ON / OFF).
     - Simple telemetry history chart (e.g., using `recharts` or lightweight chart libraries).
2. **Backend (Node.js + Express + TypeScript):**
   - `GET /api/v1/devices/status` - Fetch latest device telemetry and status.
   - `POST /api/v1/devices/telemetry` - Simulate embedded board sending telemetry data.
   - `PATCH /api/v1/devices/control` - Toggle device state (ON/OFF).
3. **Database (MongoDB):**
   - Single `Device` collection (device_id, name, status, updatedAt).
   - Single `TelemetryLog` collection (device_id, temp, humidity, timestamp).

---

## Coding Standards & Conventions

- **TypeScript:** Strict type definitions. Avoid using `any`. Define interfaces for all API payloads and DB models.
- **Code Style:** Clean, modular, functional components. Keep backend controllers clean and database calls isolated.
- **Git Commits:** Follow Conventional Commits format (e.g., `feat: add telemetry history chart`, `fix: update express cors config`).

---

## Key Talking Points for Interview Presentation
When generating documentation or code comments, align with Gravitech Thai's focus:
- Demonstrate clear understanding of hardware-to-software communication (simulated IoT payload handling).
- Show clean architecture, type safety, and production-ready folder structures.