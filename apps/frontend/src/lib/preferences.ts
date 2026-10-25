export type Theme = 'light' | 'dark';

/** localStorage keys — shared by the provider and the pre-paint theme script in the root layout */
export const STORAGE_KEYS = { theme: 'iot.theme', locale: 'iot.locale' } as const;
