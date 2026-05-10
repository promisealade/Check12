import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export const apiClient = axios.create({
  baseURL: `${API_BASE}/api/v1`,
  headers: { 'Content-Type': 'application/json' },
});

// ─── In-memory access token (XSS-safe, lost on page refresh by design) ───────
let _accessToken: string | null = null;
export const getAccessToken = () => _accessToken;
export const setAccessToken = (token: string) => { _accessToken = token; };
export const clearAccessToken = () => { _accessToken = null; };

// ─── Refresh token in sessionStorage (cleared on tab close) ──────────────────
const RT_KEY = 'check12_rt';

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

// ─── Request interceptor: attach Bearer token ────────────────────────────────
apiClient.interceptors.request.use((config) => {
  if (_accessToken) config.headers.Authorization = `Bearer ${_accessToken}`;
  return config;
});

// ─── Response interceptor: refresh on 401 ────────────────────────────────────
apiClient.interceptors.response.use(
  (res) => res,
  async (error: unknown) => {
    const axiosError = error as {
      response?: { status: number };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      config: any;
    };

    if (axiosError.response?.status === 401 && !axiosError.config._retry) {
      axiosError.config._retry = true;
      const rt = getRefreshToken();
      if (rt) {
        try {
          const res = await axios.post<{ accessToken: string; refreshToken: string }>(
            `${API_BASE}/api/v1/auth/refresh`,
            { refreshToken: rt },
          );
          setTokens(res.data.accessToken, res.data.refreshToken);
          return apiClient(axiosError.config);
        } catch {
          clearTokens();
          if (typeof window !== 'undefined') window.location.href = '/login';
        }
      } else {
        if (typeof window !== 'undefined') window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  },
);
