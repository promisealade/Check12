'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '../../../lib/hooks/useAuth';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [form, setForm] = useState({ identifier: '', password: '' });
  const [mfaState, setMfaState] = useState<{ active: true; token: string } | { active: false }>({
    active: false,
  });
  const [mfaCode, setMfaCode] = useState('');
  const [newDevice, setNewDevice] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await login(form);
      if (result.requiresMfa) {
        setMfaState({ active: true, token: result.mfaToken });
      } else {
        if (result.newDevice) setNewDevice(true);
        else router.replace('/wallet');
      }
    } catch (err: unknown) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  const { verifyMfa } = useAuth();

  async function handleMfa(e: React.FormEvent) {
    e.preventDefault();
    if (!mfaState.active) return;
    setError('');
    setLoading(true);
    try {
      const result = await verifyMfa(mfaState.token, mfaCode);
      if (result.newDevice) setNewDevice(true);
      else router.replace('/wallet');
    } catch (err: unknown) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  // New device alert banner (prototype always triggers)
  if (newDevice) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md card text-center space-y-4">
          <div className="text-4xl">🔔</div>
          <h2 className="text-xl font-semibold text-gray-800">New device detected</h2>
          <p className="text-gray-500 text-sm">
            We noticed you signed in from a new location. If this was you, you're all set.
          </p>
          <button
            className="btn-primary w-full"
            onClick={() => router.replace('/wallet')}
          >
            Continue to wallet
          </button>
        </div>
      </div>
    );
  }

  // MFA step
  if (mfaState.active) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-brand-600">Afrione</h1>
            <p className="mt-1 text-gray-500 text-sm">Two-factor verification</p>
          </div>

          <div className="card">
            <p className="text-sm text-gray-600 mb-4">
              Enter the 6-digit code from your authenticator app.
              <span className="block text-xs text-gray-400 mt-1">
                (Prototype: any 6-digit number is accepted)
              </span>
            </p>

            <form onSubmit={handleMfa} className="space-y-4">
              <div>
                <label className="label" htmlFor="mfa-code">
                  Authentication code
                </label>
                <input
                  id="mfa-code"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="000000"
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ''))}
                  className="input text-center text-2xl tracking-widest"
                  autoFocus
                  required
                />
              </div>

              {error && (
                <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <button type="submit" disabled={loading || mfaCode.length < 6} className="btn-primary w-full">
                {loading ? 'Verifying…' : 'Verify'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Login form
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-brand-600">Afrione</h1>
          <p className="mt-1 text-gray-500 text-sm">Sign in to your account</p>
        </div>

        <div className="card">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="label" htmlFor="identifier">
                Phone or email
              </label>
              <input
                id="identifier"
                name="identifier"
                type="text"
                placeholder="+233244000001 or you@example.com"
                value={form.identifier}
                onChange={handleChange}
                className="input"
                autoComplete="username"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="label" htmlFor="password">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-brand-600 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                className="input"
                autoComplete="current-password"
                required
              />
            </div>

            {error && (
              <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Don't have an account?{' '}
            <Link href="/register" className="text-brand-600 hover:underline font-medium">
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function extractErrorMessage(err: unknown): string {
  if (typeof err === 'object' && err !== null) {
    const e = err as { response?: { data?: { detail?: string; message?: string } } };
    return (
      e.response?.data?.detail ??
      e.response?.data?.message ??
      'Something went wrong. Please try again.'
    );
  }
  return 'Something went wrong. Please try again.';
}
