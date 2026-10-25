# Mini IoT Dashboard & Device Management Platform

ระบบ Full Stack ตัวอย่าง (MVP) สำหรับติดตามค่าจากบอร์ดเซนเซอร์ IoT (จำลอง) แบบเกือบเรียลไทม์ และสั่งเปิด/ปิดรีเลย์หรือ LED จากระยะไกลผ่านหน้าเว็บ

| ส่วน     | เทคโนโลยี                                                     |
| -------- | ------------------------------------------------------------- |
| Frontend | Next.js 15 (App Router), TypeScript, Tailwind CSS 4, Recharts |
| Backend  | Node.js, Express, TypeScript                                  |
| Database | MongoDB (Mongoose)                                            |

## สถาปัตยกรรม

```
┌──────────────────┐   POST /telemetry (temp, humidity)   ┌──────────────────┐        ┌──────────┐
│ บอร์ด Embedded    │ ───────────────────────────────────▶ │  Express API     │ ─────▶ │ MongoDB  │
│ (simulator.ts /  │ ◀─────────────────────────────────── │  /api/v1/devices │ ◀───── │          │
│  ESP32 firmware) │   201 ACK + { command: { status } }  └──────────────────┘        └──────────┘
└──────────────────┘                                          ▲        │
                                       PATCH /control (ON/OFF)│        │ GET /status (polling ทุก 2 วินาที)
                                                         ┌────┴────────▼────┐
                                                         │ Next.js Dashboard│
                                                         └──────────────────┘
```

**ส่งคำสั่งกลับไปพร้อมคำตอบ (Piggybacked ACK)** — บอร์ดที่ใช้แบตเตอรี่หรืออยู่หลังเราเตอร์ (NAT) มักรับการเชื่อมต่อจากภายนอกไม่ได้
ระบบนี้จึงไม่ใช้ message broker แต่ส่งสถานะรีเลย์ที่ต้องการกลับไปในคำตอบของ telemetry แทน
บอร์ดจะได้รับคำสั่งในรอบถัดไปที่ส่งข้อมูลขึ้นมา ซึ่งเป็นรูปแบบเดียวกับที่แพลตฟอร์ม IoT แบบ HTTP/CoAP หลายเจ้าใช้

## โครงสร้างโปรเจกต์

```
apps/
├── backend/src
│   ├── config/        ตั้งค่า env + เชื่อมต่อ MongoDB
│   ├── models/        Device, TelemetryLog (Mongoose schema)
│   ├── types/         รูปแบบข้อมูล (contract) ของ API
│   ├── validators/    ตรวจสอบ payload (type guard, ช่วงค่าของเซนเซอร์)
│   ├── services/      ส่วนที่ติดต่อฐานข้อมูลทั้งหมด
│   ├── controllers/   จัดการ HTTP request/response
│   ├── routes/        /api/v1/devices
│   ├── middleware/    จัดการ error
│   └── scripts/       simulator.ts — บอร์ดจำลอง ESP32 + DHT22
└── frontend/src
    ├── app/           จุดเริ่มต้นของ Next.js App Router
    ├── components/    Dashboard, DeviceVisual (GreenhouseScene / BoardSimulation),
    │                  SensorGauge, RelayToggle, TelemetryChart, PreferencesProvider
    ├── hooks/         useDeviceStatus (polling + toggle แบบ optimistic)
    ├── lib/           API client, คำแปล EN/TH (i18n), ค่าตั้งค่าธีม
    └── types/         type ของ API
```

## เริ่มต้นใช้งาน

สิ่งที่ต้องมี: Node.js 20 ขึ้นไป และ MongoDB (ติดตั้งในเครื่อง, `docker compose up -d` หรือใช้ URI ของ MongoDB Atlas)

```bash
npm install
cp apps/backend/.env.example apps/backend/.env
cp apps/frontend/.env.example apps/frontend/.env.local
npm run dev          # API ที่พอร์ต 4000, Dashboard ที่พอร์ต 3000
npm run simulate     # เปิดอีก terminal — เริ่มบอร์ดจำลอง
```

เปิด http://localhost:3000 แล้วลองกดเปิดรีเลย์ บอร์ดจำลองจะเปิด "พัดลมระบายความร้อน"
และกราฟอุณหภูมิจะเริ่มลดลง เมื่อปิดพัดลมอุณหภูมิจะค่อย ๆ กลับขึ้นไป

## หน้า Dashboard

- **เกจอุณหภูมิและความชื้น** — แสดงค่าล่าสุดจากเซนเซอร์
- **จำลองอุปกรณ์** (การ์ดกลางจอ) มี 2 มุมมองให้สลับ:
  - 🌱 **โรงเรือน** — ภาพโรงเรือนปลูกผักสลัดที่เปลี่ยนตามข้อมูลจริง ผักเปลี่ยนสีตามช่วงอุณหภูมิ
    (**เหมาะสม** ≤ 28 °C, **ค่อนข้างร้อน** 28–31 °C, **ร้อนเกินไป** > 31 °C) เมื่อเปิดพัดลม ใบพัดบนผนังจะหมุน
    ลมพัดออก และผักโยกตามลม คลิกที่พัดลมเพื่อเปิด/ปิดได้
  - 🔌 **วงจร** — ภาพบอร์ดเคลื่อนไหว (DHT22 → ESP32 → Relay → พัดลม) แสดงการอ่านเซนเซอร์,
    การส่งข้อมูลผ่าน Wi-Fi และก้านหน้าสัมผัสของรีเลย์ คลิกที่รีเลย์บนภาพเพื่อเปิด/ปิดได้
- **สวิตช์ Relay / LED** — สั่งเปิด/ปิดอุปกรณ์
- **กราฟประวัติ** — แสดงอุณหภูมิและความชื้นย้อนหลัง 30 ค่า
- **สถานะ Online / Offline** — เป็น Offline เมื่อไม่ได้รับข้อมูลจากบอร์ดเกิน 15 วินาที
- **ปุ่ม `EN | ไทย`** — สลับภาษาของหน้าเว็บ
- **ปุ่ม ☀️ / 🌙** — สลับโหมดสว่าง/มืด (ภาพโรงเรือนเปลี่ยนเป็นกลางวัน/กลางคืนตาม)

ภาษาและธีมที่เลือกจะถูกจำไว้ในเบราว์เซอร์ เปิดครั้งต่อไปยังเป็นแบบเดิม

## API

Base URL: `http://localhost:4000/api/v1`

| Method | Path                 | คำอธิบาย                                            |
| ------ | -------------------- | --------------------------------------------------- |
| GET    | `/devices/status`    | ข้อมูลอุปกรณ์, ค่าล่าสุด, ประวัติ และสถานะออนไลน์ |
| POST   | `/devices/telemetry` | บอร์ดส่งข้อมูลเซนเซอร์ขึ้นมา                        |
| PATCH  | `/devices/control`   | สั่งรีเลย์เป็น `ON` / `OFF`                         |

```bash
# บอร์ดส่งข้อมูลขึ้นมา
curl -X POST http://localhost:4000/api/v1/devices/telemetry \
  -H "Content-Type: application/json" \
  -d '{"device_id":"esp32-node-01","temp":27.4,"humidity":61.2}'
# → 201 {"accepted":true,"telemetry":{...},"command":{"status":"OFF"}}

# Dashboard สั่งเปิดรีเลย์
curl -X PATCH http://localhost:4000/api/v1/devices/control \
  -H "Content-Type: application/json" \
  -d '{"device_id":"esp32-node-01","status":"ON"}'

# ดูสถานะ (+ ค่าย้อนหลัง 30 ค่า)
curl "http://localhost:4000/api/v1/devices/status?device_id=esp32-node-01&history=30"
```

payload ที่ไม่ถูกต้อง เช่น ชนิดข้อมูลผิด, ความชื้นนอกช่วง 0–100 % หรืออุณหภูมินอกช่วงที่เซนเซอร์วัดได้ (−40…125 °C)
จะถูกปฏิเสธด้วย `400` พร้อมรายการ `details` ที่บอกว่าผิดตรงไหน

## โครงสร้างข้อมูล

- **Device** — `device_id` (ไม่ซ้ำ), `name`, `status` (`ON`|`OFF`), `updatedAt`
- **TelemetryLog** — `device_id`, `temp`, `humidity`, `timestamp` — มี index `{ device_id, timestamp: -1 }`
