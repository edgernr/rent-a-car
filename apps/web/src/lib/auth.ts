'use client';

// Relative path → goes through the Next.js rewrite proxy to the API, so the
// session cookie is set first-party on the storefront's own origin.
const API = '/api/v1';

export type Me = {
  user: { id: string; email: string; name: string | null; platformRole: string };
  vendor: unknown | null;
};

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    ...init,
    credentials: 'include',
    headers: { 'content-type': 'application/json', ...(init?.headers ?? {}) },
  });
  if (!res.ok) {
    let msg = `Error ${res.status}`;
    try {
      msg = (await res.json()).message ?? msg;
    } catch {
      /* ignore */
    }
    throw new Error(msg);
  }
  return res.status === 204 ? (undefined as T) : res.json();
}

export const getMe = () => req<Me>('/auth/me');
export const register = (email: string, password: string, name: string) =>
  req<{ user: Me['user'] }>('/auth/register', { method: 'POST', body: JSON.stringify({ email, password, name }) });
export const signIn = (email: string, password: string) =>
  req<{ user: Me['user'] }>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
export const signOut = () => req<void>('/auth/logout', { method: 'POST' });
