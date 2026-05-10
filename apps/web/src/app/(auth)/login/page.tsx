'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '../../../lib/hooks/useAuth';
import { Icon } from '../../../lib/icons';
import { AuthShell } from '../../../lib/components/AuthShell';

export default function LoginPage() {
  const router = useRouter();
  const { login, verifyMfa } = useAuth();

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
      if (result.requiresMfa) setMfaState({ active: true, token: result.mfaToken });
      else if (result.newDevice) setNewDevice(true);
      else router.replace('/wallet');
    } catch (err: unknown) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

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

  if (newDevice) {
    return (
      <AuthShell title="New device detected" subtitle="If this was you, you're all set.">
        <div className="text-center space-y-4">
          <div className="mx-auto w-14 h-14 rounded-full bg-sand-100 text-gold-700 flex items-center justify-center">
            <Icon name="bell" className="w-6 h-6" />
          </div>
          <p className="text-sm text-muted-500">
            We noticed you signed in from a new location.
          </p>
          <button className="btn-primary w-full" onClick={() => router.replace('/wallet')}>
            Continue to wallet
          </button>
        </div>
      </AuthShell>
    );
  }

  if (mfaState.active) {
    return (
      <AuthShell title="Two-factor verification" subtitle="Enter the 6-digit code from your authenticator">
        <form onSubmit={handleMfa} className="space-y-4">
          <p className="text-xs text-muted-400 -mt-2">Prototype: any 6-digit number is accepted.</p>
          <div>
            <label className="label" htmlFor="mfa-code">Authentication code</label>
            <input
              id="mfa-code"
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="000000"
              value={mfaCode}
              onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ''))}
              className="input text-center text-2xl tracking-[0.4em]"
              autoFocus
              required
            />
          </div>
          {error && <div className="alert-error">{error}</div>}
          <button type="submit" disabled={loading || mfaCode.length < 6} className="btn-primary w-full">
            {loading ? 'Verifying…' : 'Verify'}
          </button>
        </form>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Welcome back" subtitle="Sign in to your Afrione wallet">
      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="label" htmlFor="identifier">Phone or email</label>
          <input
            id="identifier"
            name="identifier"
            type="text"
            placeholder="amara@example.com"
            value={form.identifier}
            onChange={handleChange}
            className="input"
            autoComplete="username"
            required
          />
        </div>
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="label !mb-0" htmlFor="password">Password</label>
            <Link href="/forgot-password" className="text-xs text-gold-700 hover:underline font-medium">
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
        {error && <div className="alert-error">{error}</div>}
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      {/* Demo accounts callout */}
      <div className="mt-5 rounded-2xl bg-sand-100/70 ring-1 ring-gold-200/60 p-4">
        <div className="flex items-start gap-3">
          <span className="w-8 h-8 rounded-full bg-gold-400 text-brand-900 flex items-center justify-center shrink-0">
            <Icon name="star" className="w-4 h-4" />
          </span>
          <div className="text-xs text-muted-600 space-y-1 flex-1">
            <p className="font-medium text-gold-700">Try a demo account</p>
            <p className="font-mono text-brand-700">amara@example.com<span className="text-muted-500 font-sans"> · regular user</span></p>
            <p className="font-mono text-brand-700">akosua@sme.com<span className="text-muted-500 font-sans"> · business</span></p>
            <p className="font-mono text-brand-700">admin@afrione.com<span className="text-muted-500 font-sans"> · admin</span></p>
            <p className="text-muted-500 pt-1">
              Password: <span className="font-mono text-brand-700">Password123!</span>
              <span className="text-muted-400"> (admin: </span>
              <span className="font-mono text-brand-700">Admin@afrione!</span>
              <span className="text-muted-400">)</span>
            </p>
          </div>
        </div>
      </div>

      <p className="mt-6 text-center text-sm text-muted-500">
        New to Afrione?{' '}
        <Link href="/register" className="text-gold-700 hover:underline font-medium">
          Create an account
        </Link>
      </p>
    </AuthShell>
  );
}

function extractErrorMessage(err: unknown): string {
  if (typeof err === 'object' && err !== null) {
    const e = err as { response?: { data?: { detail?: string; message?: string } } };
    return e.response?.data?.detail ?? e.response?.data?.message ?? 'Something went wrong. Please try again.';
  }
  return 'Something went wrong. Please try again.';
}
