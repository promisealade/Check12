'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '../../../lib/hooks/useAuth';

type AccountType = 'individual' | 'business';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [accountType, setAccountType] = useState<AccountType>('individual');
  const [form, setForm] = useState({
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    businessName: '',
    registrationNumber: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await register({
        phone: form.phone,
        email: form.email,
        password: form.password,
        accountType,
        businessName: accountType === 'business' ? form.businessName : undefined,
        registrationNumber: accountType === 'business' ? form.registrationNumber : undefined,
      });

      // Navigate to OTP verification, passing phone via query param
      router.push(`/verify-phone?phone=${encodeURIComponent(form.phone)}&next=/login`);
    } catch (err: unknown) {
      const msg = extractErrorMessage(err);
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-brand-600">Check12</h1>
          <p className="mt-1 text-gray-500 text-sm">Create your account</p>
        </div>

        <div className="card">
          {/* Account type toggle */}
          <div className="flex rounded-lg overflow-hidden border border-gray-200 mb-6">
            {(['individual', 'business'] as AccountType[]).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setAccountType(type)}
                className={`flex-1 py-2 text-sm font-medium capitalize transition-colors ${
                  accountType === type
                    ? 'bg-brand-600 text-white'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label" htmlFor="phone">
                Phone number
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                placeholder="+233244000000"
                value={form.phone}
                onChange={handleChange}
                className="input"
                required
              />
            </div>

            <div>
              <label className="label" htmlFor="email">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                className="input"
                required
              />
            </div>

            <div>
              <label className="label" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="Min. 8 characters"
                value={form.password}
                onChange={handleChange}
                className="input"
                required
              />
              <p className="text-xs text-gray-400 mt-1">
                Must contain uppercase, lowercase, and a number
              </p>
            </div>

            <div>
              <label className="label" htmlFor="confirmPassword">
                Confirm password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Repeat password"
                value={form.confirmPassword}
                onChange={handleChange}
                className="input"
                required
              />
            </div>

            {accountType === 'business' && (
              <>
                <div>
                  <label className="label" htmlFor="businessName">
                    Business name
                  </label>
                  <input
                    id="businessName"
                    name="businessName"
                    type="text"
                    placeholder="Akosua Textiles Ltd"
                    value={form.businessName}
                    onChange={handleChange}
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label className="label" htmlFor="registrationNumber">
                    Registration number
                  </label>
                  <input
                    id="registrationNumber"
                    name="registrationNumber"
                    type="text"
                    placeholder="GH-BIZ-XXXXXXXX"
                    value={form.registrationNumber}
                    onChange={handleChange}
                    className="input"
                    required
                  />
                </div>
              </>
            )}

            {error && (
              <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link href="/login" className="text-brand-600 hover:underline font-medium">
              Sign in
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
