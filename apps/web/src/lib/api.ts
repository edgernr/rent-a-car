/** Server-side fetch helpers for the public API, with graceful fallbacks
 * so the storefront still renders when the API is not running (early dev).
 * These run on the server (SSR), so they hit the API directly (absolute URL). */

const API_ORIGIN = process.env.API_ORIGIN ?? 'http://localhost:4000';
const API = `${API_ORIGIN}/api/v1`;

export type Vehicle = {
  id: string;
  name: string;
  category: string;
  transmission: 'AUTOMATIC' | 'MANUAL';
  seats: number;
  bags: number;
  dailyRateUsd: number;
  dailyRateUzs: number;
  popular: boolean;
  vendor?: { displayName: string; city?: string | null };
};

export type Route = {
  id: string;
  slug: string;
  km: number;
  durationHrs: number;
  nameI18n: Record<string, string>;
  taglineI18n: Record<string, string>;
};

export type Addon = {
  type: string;
  priceUzs: number;
  priceUsd: number;
};

async function get<T>(path: string, fallback: T): Promise<T> {
  try {
    const res = await fetch(`${API}${path}`, { cache: 'no-store' });
    if (!res.ok) return fallback;
    return (await res.json()) as T;
  } catch {
    return fallback;
  }
}

export const getVehicles = () => get<Vehicle[]>('/vehicles', FALLBACK_VEHICLES);
export const getRoutes = () => get<Route[]>('/routes', FALLBACK_ROUTES);
export const getAddons = () => get<Addon[]>('/addons', FALLBACK_ADDONS);

const FALLBACK_ADDONS: Addon[] = [
  { type: 'DRIVER', priceUzs: 44100000, priceUsd: 35 },
  { type: 'CDW_INSURANCE', priceUzs: 15120000, priceUsd: 12 },
  { type: 'GPS', priceUzs: 6300000, priceUsd: 5 },
  { type: 'CHILD_SEAT', priceUzs: 5040000, priceUsd: 4 },
  { type: 'WIFI', priceUzs: 7560000, priceUsd: 6 },
  { type: 'UNLIMITED_MILEAGE', priceUzs: 11340000, priceUsd: 9 },
];

// Minimal fallbacks (mirror the seed) so the page is never blank in early dev.
const FALLBACK_VEHICLES: Vehicle[] = [
  { id: '1', name: 'Chevrolet Cobalt', category: 'SEDAN', transmission: 'AUTOMATIC', seats: 5, bags: 3, dailyRateUsd: 28, dailyRateUzs: 35280000, popular: true },
  { id: '2', name: 'Chevrolet Tracker', category: 'SUV', transmission: 'AUTOMATIC', seats: 5, bags: 4, dailyRateUsd: 48, dailyRateUzs: 60480000, popular: true },
  { id: '3', name: 'BYD Song Plus EV', category: 'ELECTRIC', transmission: 'AUTOMATIC', seats: 5, bags: 4, dailyRateUsd: 58, dailyRateUzs: 73080000, popular: true },
];

const FALLBACK_ROUTES: Route[] = [
  { id: '1', slug: 'samarkand', km: 280, durationHrs: 4, nameI18n: { en: 'Samarkand', ru: 'Самарканд', uz: 'Samarqand' }, taglineI18n: { en: 'Registan & the Timurid heart', ru: 'Регистан и сердце Тимуридов', uz: 'Registon va Temuriylar yuragi' } },
  { id: '2', slug: 'bukhara', km: 600, durationHrs: 7, nameI18n: { en: 'Bukhara', ru: 'Бухара', uz: 'Buxoro' }, taglineI18n: { en: 'Holy city of the Silk Road', ru: 'Священный город Шёлкового пути', uz: 'Ipak yo‘lining muqaddas shahri' } },
  { id: '3', slug: 'khiva', km: 1000, durationHrs: 12, nameI18n: { en: 'Khiva', ru: 'Хива', uz: 'Xiva' }, taglineI18n: { en: 'Walled desert citadel', ru: 'Крепость посреди пустыни', uz: 'Cho‘l qa’lasi' } },
];
