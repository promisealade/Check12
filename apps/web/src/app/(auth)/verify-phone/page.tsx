'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { useAuth } from '../../../lib/hooks/useAuth';
import { Icon } from '../../../lib/icons';
import { AuthShell } from '../../../lib/components/AuthShell';

function VerifyPhoneContent() {
  const router = useRouter();
  const params = useSearchParams();
  const phone = params.get('phone') ?? '';
  const next = params.get('next') ?? '/wallet';

  const { verifyPhone, resendOtp } = useAuth();

  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await verifyPhone(phone, otp);
      setVerified(true);
      setTimeout(() => router.replace(next), 1500);
    } catch (err: unknown) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (resendCooldown > 0) return;
    try {
      await resendOtp(phone);
      setResendCooldown(60);
      setError('');
    } catch {
      setError('Failed to resend OTP. Please try again.');
    }
  }

  if (verified) {
    return (
      <AuthShell title="Phone verified" subtitle="Redirecting you now…">
        <div className="text-center space-y-3">
          <div className="mx-auto w-14 h-14 rounded-full bg-sage-200 text-brand-700 flex items-center justify-center">
            <Icon name="checkCircle" className="w-7 h-7" />
          </div>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Verify your phone" subtitle={`We sent a 6-digit code to ${phone || 'your phone'}`}>
      <p className="text-xs text-muted-400 mb-3 -mt-2">
        Prototype: any 6-digit number is accepted.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label" htmlFor="otp">Verification code</label>
          <input
            id="otp"
            type="text"
            inputMode="numeric"
            maxLength={6}
            placeholder="000000"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
            className="input text-center text-2xl tracking-[0.4em]"
            autoFocus
            required
          />
        </div>

        {error && <div className="alert-error">{error}</div>}

        <button type="submit" disabled={loading || otp.length < 6} className="btn-primary w-full">
          {loading ? 'Verifying…' : 'Verify phone'}
        </button>
      </form>

      <div className="text-center text-sm text-muted-500 mt-5">
        Didn't receive a code?{' '}
        <button
          onClick={handleResend}
          disabled={resendCooldown > 0}
          className={`font-medium ${
            resendCooldown > 0 ? 'text-muted-400 cursor-not-allowed' : 'text-gold-700 hover:underline'
          }`}
        >
          {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend OTP'}
        </button>
      </div>
    </AuthShell>
  );
}

export default function VerifyPhonePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-parchment">Loading…</div>}>
      <VerifyPhoneContent />
    </Suspense>
  );
}

function extractErrorMessage(err: unknown): string {
  if (typeof err === 'object' && err !== null) {
    const e = err as { response?: { data?: { detail?: string; message?: string } } };
    return e.response?.data?.detail ?? e.response?.data?.message ?? 'Invalid or expired OTP. Please try again.';
  }
  return 'Invalid or expired OTP. Please try again.';
}
