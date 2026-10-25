export const LOCALES = ['en', 'th'] as const;
export type Locale = (typeof LOCALES)[number];

export interface Dictionary {
  appTitle: string;
  loadingDevice: string;
  online: string;
  offline: string;
  polled: string;
  temperature: string;
  humidity: string;
  relayTitle: string;
  relayToggleAria: string;
  relayNote: string;
  boardTitle: string;
  boardHint: string;
  boardAria: (status: string) => string;
  noSignal: string;
  views: { greenhouse: string; circuit: string };
  sceneHint: string;
  sceneAria: string;
  sceneCaption: string;
  climate: { optimal: string; warm: string; hot: string };
  chartTitle: string;
  lastReadings: (count: number) => string;
  waitingTelemetry: string;
  tempSeries: string;
  humiditySeries: string;
  apiError: string;
  footer: (seconds: number) => string;
  switchToLight: string;
  switchToDark: string;
  languageLabel: string;
}

export const dictionaries: Record<Locale, Dictionary> = {
  en: {
    appTitle: 'Mini IoT Dashboard',
    loadingDevice: 'Loading device…',
    online: 'Online',
    offline: 'Offline',
    polled: 'Polled',
    temperature: 'Temperature',
    humidity: 'Humidity',
    relayTitle: 'Relay / LED',
    relayToggleAria: 'Toggle relay',
    relayNote: 'Command is delivered to the board on its next telemetry uplink.',
    boardTitle: 'Device simulation',
    boardHint: 'Click the relay to toggle',
    boardAria: (status) => `Relay ${status}. Click to toggle`,
    noSignal: 'NO SIGNAL',
    views: { greenhouse: 'Greenhouse', circuit: 'Circuit' },
    sceneHint: 'Click the fan to toggle',
    sceneAria: 'Lettuce greenhouse monitored by the ESP32 node',
    sceneCaption: 'Lettuce grows best below 28 °C. When it gets too hot, switch on the exhaust fan.',
    climate: { optimal: 'OPTIMAL', warm: 'WARM', hot: 'TOO HOT' },
    chartTitle: 'Telemetry history',
    lastReadings: (count) => `Last ${count} readings`,
    waitingTelemetry: 'Waiting for telemetry… run',
    tempSeries: 'Temperature (°C)',
    humiditySeries: 'Humidity (%)',
    apiError: 'Cannot reach API at',
    footer: (seconds) => `Next.js · Express · MongoDB — polling every ${seconds}s`,
    switchToLight: 'Switch to light mode',
    switchToDark: 'Switch to dark mode',
    languageLabel: 'Language',
  },
  th: {
    appTitle: 'แดชบอร์ด IoT',
    loadingDevice: 'กำลังโหลดอุปกรณ์…',
    online: 'ออนไลน์',
    offline: 'ออฟไลน์',
    polled: 'อัปเดตล่าสุด',
    temperature: 'อุณหภูมิ',
    humidity: 'ความชื้น',
    relayTitle: 'รีเลย์ / LED',
    relayToggleAria: 'เปิด/ปิดรีเลย์',
    relayNote: 'คำสั่งจะถูกส่งถึงบอร์ดในรอบถัดไปที่บอร์ดส่งข้อมูลขึ้นมา',
    boardTitle: 'จำลองอุปกรณ์',
    boardHint: 'คลิกที่รีเลย์เพื่อเปิด/ปิด',
    boardAria: (status) => `รีเลย์ ${status} คลิกเพื่อเปิด/ปิด`,
    noSignal: 'ไม่มีสัญญาณ',
    views: { greenhouse: 'โรงเรือน', circuit: 'วงจร' },
    sceneHint: 'คลิกที่พัดลมเพื่อเปิด/ปิด',
    sceneAria: 'โรงเรือนปลูกผักสลัดที่ตรวจวัดด้วยบอร์ด ESP32',
    sceneCaption: 'ผักสลัดโตได้ดีที่อุณหภูมิต่ำกว่า 28 °C ถ้าร้อนเกินไปให้เปิดพัดลมระบายอากาศ',
    climate: { optimal: 'เหมาะสม', warm: 'ค่อนข้างร้อน', hot: 'ร้อนเกินไป' },
    chartTitle: 'ประวัติข้อมูลเซนเซอร์',
    lastReadings: (count) => `ย้อนหลัง ${count} ค่า`,
    waitingTelemetry: 'กำลังรอข้อมูลจากบอร์ด… รัน',
    tempSeries: 'อุณหภูมิ (°C)',
    humiditySeries: 'ความชื้น (%)',
    apiError: 'เชื่อมต่อ API ไม่ได้ที่',
    footer: (seconds) => `Next.js · Express · MongoDB — ดึงข้อมูลทุก ${seconds} วินาที`,
    switchToLight: 'เปลี่ยนเป็นโหมดสว่าง',
    switchToDark: 'เปลี่ยนเป็นโหมดมืด',
    languageLabel: 'ภาษา',
  },
};

/** BCP 47 tag used for date/time formatting */
export const intlLocale: Record<Locale, string> = { en: 'en-US', th: 'th-TH' };
