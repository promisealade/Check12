'use client';

import { useRouter } from 'next/navigation';
import { apiClient, setTokens, clearTokens, getRefreshToken } from '../api/client';
import { useAuthStore } from '../stores/auth.store';

export interface RegisterPayload {
  phone: string;
  email: string;
  password: string;
  accountType: 'individual' | 'business';
  businessName?: string;
  registrationNumber?: string;
}

export interface LoginPayload {
  identifier: string;
  password: string;
}

export type LoginResult =
  | { requiresMfa: true; mfaToken: string }
  | { requiresMfa: false; newDevice: boolean };

export function useAuth() {
  const { setUser, clearUser } = useAuthStore();
  const router = useRouter();

  async function register(payload: RegisterPayload) {
    const { data } = await apiClient.post<{ userId: string; message: string }>(
      '/auth/register',
      payload,
    );
    return data;
  }

  async function verifyPhone(phone: string, otp: string) {
    const { data } = await apiClient.post<{ verified: boolean }>(
      '/auth/verify-phone',
      { phone, otp },
    );
    return data;
  }

  async function resendOtp(phone: string) {
    await apiClient.post('/auth/resend-otp', { phone });
  }

  async function login(payload: LoginPayload): Promise<LoginResult> {
    const { data } = await apiClient.post<
      | { requiresMfa: true; mfaToken: string }
      | { requiresMfa: false; newDevice: boolean; accessToken: string; refreshToken: string }
    >('/auth/login', payload);

    if (!data.requiresMfa) {
      setTokens(data.accessToken, data.refreshToken);
      const profile = await fetchProfile();
      setUser(profile);
      return { requiresMfa: false, newDevice: data.newDevice };
    }

    return { requiresMfa: true, mfaToken: data.mfaToken };
  }

  async function verifyMfa(mfaToken: string, code: string) {
    const { data } = await apiClient.post<{
      newDevice: boolean;
      accessToken: string;
      refreshToken: string;
    }>('/auth/verify-mfa', { mfaToken, code });

    setTokens(data.accessToken, data.refreshToken);
    const profile = await fetchProfile();
    setUser(profile);
    return { newDevice: data.newDevice };
  }

  async function logout() {
    const rt = getRefreshToken();
    if (rt) {
      try {
        await apiClient.post('/auth/logout', { refreshToken: rt });
      } catch {
        // best-effort
      }
    }
    clearTokens();
    clearUser();
    router.replace('/login');
  }

  return { register, verifyPhone, resendOtp, login, verifyMfa, logout };
}

async function fetchProfile() {
  const { data } = await apiClient.get('/users/me');
  return data;
}
