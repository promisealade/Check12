'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { useAuth } from '../../../lib/hooks/useAuth';

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

  // Countdown timer for resend button
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="card text-center space-y-4 w-full max-w-sm">
          <div className="text-5xl">✅</div>
          <h2 className="text-xl font-semibold text-gray-800">Phone verified!</h2>
          <p className="text-gray-500 text-sm">Redirecting you now…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-brand-600">Afrione</h1>
          <p className="mt-1 text-gray-500 text-sm">Verify your phone number</p>
        </div>

        <div className="card space-y-4">
          <p className="text-sm text-gray-600">
            We sent a 6-digit code to{' '}
            <span className="font-medium text-gray-800">{phone}</span>.
            <span className="block text-xs text-gray-400 mt-1">
              (Prototype: check the API server console for the OTP)
            </span>
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label" htmlFor="otp">
                Verification code
              </label>
              <input
                id="otp"
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="000000"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
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

            <button
              type="submit"
              disabled={loading || otp.length < 6}
              className="btn-primary w-full"
            >
              {loading ? 'Verifying…' : 'Verify phone'}
            </button>
          </form>

          <div className="text-center text-sm text-gray-500">
            Didn't receive a code?{' '}
            <button
              onClick={handleResend}
              disabled={resendCooldown > 0}
              className={`font-medium ${
                resendCooldown > 0
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-brand-600 hover:underline'
              }`}
            >
              {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend OTP'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VerifyPhonePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading…</div>}>
      <VerifyPhoneContent />
    </Suspense>
  );
}

function extractErrorMessage(err: unknown): string {
  if (typeof err === 'object' && err !== null) {
    const e = err as { response?: { data?: { detail?: string; message?: string } } };
    return (
      e.response?.data?.detail ??
      e.response?.data?.message ??
      'Invalid or expired OTP. Please try again.'
    );
  }
  return 'Invalid or expired OTP. Please try again.';
}
