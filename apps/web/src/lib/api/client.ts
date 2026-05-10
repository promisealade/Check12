'use client';

// Mock API client — same surface as the original axios-based one.
// All requests are dispatched to the in-memory backend in `./mock`.

import { decodeToken, handleRequest } from './mock';

type Method = 'GET' | 'POST' | 'PATCH' | 'DELETE' | 'PUT';

// ─── In-memory access token (cleared on hard refresh by design) ─────────────
let _accessToken: string | null = null;
export const getAccessToken = () => _accessToken;
export const setAccessToken = (token: string) => { _accessToken = token; };
export const clearAccessToken = () => { _accessToken = null; };

// ─── Refresh token in sessionStorage (cleared on tab close) ──────────────────
const RT_KEY = 'afrione_rt';

export function setTokens(access: string, refresh: string) {
  _accessToken = access;
  if (typeof window !== 'undefined') sessionStorage.setItem(RT_KEY, refresh);
}

export function clearTokens() {
  _accessToken = null;
  if (typeof window !== 'undefined') sessionStorage.removeItem(RT_KEY);
}

export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem(RT_KEY);
}

function authUserId(): string | null {
  return decodeToken(_accessToken)?.userId ?? null;
}

async function attempt(method: Method, path: string, body?: unknown) {
  return handleRequest(
    method,
    path,
    body as Record<string, unknown> | undefined,
    authUserId(),
  );
}

async function request(method: Method, path: string, body?: unknown) {
  try {
    return await attempt(method, path, body);
  } catch (err) {
    const status = (err as { response?: { status?: number } })?.response?.status;
    if (status !== 401) throw err;

    const rt = getRefreshToken();
    if (!rt) throw err;
    try {
      const refreshed = (await handleRequest(
        'POST',
        '/auth/refresh',
        { refreshToken: rt },
        null,
      )) as { data: { accessToken: string; refreshToken: string } };
      setTokens(refreshed.data.accessToken, refreshed.data.refreshToken);
      return await attempt(method, path, body);
    } catch {
      clearTokens();
      if (
        typeof window !== 'undefined' &&
        !window.location.pathname.startsWith('/login')
      ) {
        window.location.href = '/login';
      }
      throw err;
    }
  }
}

export const apiClient = {
  get: <T = unknown>(path: string) =>
    request('GET', path) as Promise<{ data: T }>,
  post: <T = unknown>(path: string, body?: unknown) =>
    request('POST', path, body) as Promise<{ data: T }>,
  patch: <T = unknown>(path: string, body?: unknown) =>
    request('PATCH', path, body) as Promise<{ data: T }>,
  put: <T = unknown>(path: string, body?: unknown) =>
    request('PUT', path, body) as Promise<{ data: T }>,
  delete: <T = unknown>(path: string) =>
    request('DELETE', path) as Promise<{ data: T }>,
  // No-op shim — original axios instance exposed `.interceptors`.
  interceptors: {
    request: { use: () => undefined },
    response: { use: () => undefined },
  },
};
