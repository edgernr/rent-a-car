// Relative → proxied to the API (Vite proxy in dev, vercel.json in prod) so the
// session cookie is first-party on the console's origin.
const API = '/api/v1';

// All requests carry the HttpOnly session cookie.
async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    ...init,
    credentials: 'include',
    headers: { 'content-type': 'application/json', ...(init?.headers ?? {}) },
  });
  if (!res.ok) {
    let msg = `API ${res.status}`;
    try {
      const body = await res.json();
      msg = body.message ?? msg;
    } catch {
      /* ignore */
    }
    throw new ApiError(res.status, msg);
  }
  return res.status === 204 ? (undefined as T) : res.json();
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

// ── Types ─────────────────────────────────────────────────────
export type Me = {
  user: { id: string; email: string; name: string | null; platformRole: string };
  vendor: { id: string; displayName: string; status: string; role: string } | null;
};

export type Vehicle = {
  id: string;
  make: string;
  model: string;
  year: number;
  category: 'ECONOMY' | 'SEDAN' | 'SUV' | 'SEVEN_SEATER' | 'ELECTRIC';
  transmission: 'AUTOMATIC' | 'MANUAL';
  fuelType: string;
  seats: number;
  bags: number;
  plate: string | null;
  dailyRateUzs: number;
  status: 'AVAILABLE' | 'RENTED' | 'CLEANING' | 'MAINTENANCE';
  moderationStatus: string;
  popular: boolean;
};

export type CreateVehicleInput = {
  make: string;
  model: string;
  year: number;
  category: Vehicle['category'];
  transmission: Vehicle['transmission'];
  seats: number;
  plate?: string;
  dailyRateUzs: number;
};

export type VendorRegisterInput = {
  email: string;
  password: string;
  name?: string;
  legalName: string;
  displayName: string;
  city?: string;
};

// ── Auth ──────────────────────────────────────────────────────
export const getMe = () => req<Me>('/auth/me');
export const login = (email: string, password: string) =>
  req<{ user: Me['user'] }>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
export const registerVendor = (input: VendorRegisterInput) =>
  req<{ user: Me['user']; vendor: unknown }>('/auth/vendor/register', { method: 'POST', body: JSON.stringify(input) });
export const logout = () => req<void>('/auth/logout', { method: 'POST' });

// ── Platform admin ────────────────────────────────────────────
export type Vendor = {
  id: string;
  slug: string;
  displayName: string;
  legalName: string;
  city: string | null;
  status: 'DRAFT' | 'PENDING_REVIEW' | 'APPROVED' | 'SUSPENDED' | 'REJECTED';
  commissionBps: number;
  createdAt: string;
  _count?: { vehicles: number };
};

export const listVendors = () => req<Vendor[]>('/admin/vendors');
export const approveVendor = (id: string) => req<Vendor>(`/admin/vendors/${id}/approve`, { method: 'POST' });
export const suspendVendor = (id: string) => req<Vendor>(`/admin/vendors/${id}/suspend`, { method: 'POST' });

// ── Vendor-scoped ─────────────────────────────────────────────
export const fetchMyVehicles = () => req<Vehicle[]>('/vendor/vehicles');
export const createVehicle = (input: CreateVehicleInput) =>
  req<Vehicle>('/vendor/vehicles', { method: 'POST', body: JSON.stringify(input) });

// USD indicative rate for display (settlement is always UZS).
export const USD_RATE = 12600;
export const toUsd = (minorUzs: number): number => Math.round(minorUzs / 100 / USD_RATE);
export const usdToMinorUzs = (usd: number): number => Math.round(usd * USD_RATE * 100);
