'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '../../../lib/hooks/useAuth';
import { AuthShell } from '../../../lib/components/AuthShell';

type AccountType = 'individual' | 'business';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [accountType, setAccountType] = useState<AccountType>('individual');
  const [form, setForm] = useState({
    phone: '', email: '', password: '', confirmPassword: '',
    businessName: '', registrationNumber: '',
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
      router.push(`/verify-phone?phone=${encodeURIComponent(form.phone)}&next=/login`);
    } catch (err: unknown) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell title="Create your account" subtitle="Start sending and saving in stable value">
      <div className="flex rounded-2xl overflow-hidden ring-1 ring-muted-100 mb-5 bg-parchment/60 p-1">
        {(['individual', 'business'] as AccountType[]).map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => setAccountType(type)}
            className={`flex-1 py-2 text-sm font-medium capitalize rounded-xl transition-colors ${
              accountType === type
                ? 'bg-white text-brand-700 shadow-pop'
                : 'text-muted-500 hover:text-brand-700'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label" htmlFor="phone">Phone number</label>
          <input id="phone" name="phone" type="tel" placeholder="+233244000000"
            value={form.phone} onChange={handleChange} className="input" required />
        </div>
        <div>
          <label className="label" htmlFor="email">Email address</label>
          <input id="email" name="email" type="email" placeholder="you@example.com"
            value={form.email} onChange={handleChange} className="input" required />
        </div>
        <div>
          <label className="label" htmlFor="password">Password</label>
          <input id="password" name="password" type="password" placeholder="Min. 8 characters"
            value={form.password} onChange={handleChange} className="input" required />
          <p className="text-xs text-muted-400 mt-1">Must contain uppercase, lowercase, and a number.</p>
        </div>
        <div>
          <label className="label" htmlFor="confirmPassword">Confirm password</label>
          <input id="confirmPassword" name="confirmPassword" type="password" placeholder="Repeat password"
            value={form.confirmPassword} onChange={handleChange} className="input" required />
        </div>

        {accountType === 'business' && (
          <>
            <div>
              <label className="label" htmlFor="businessName">Business name</label>
              <input id="businessName" name="businessName" type="text" placeholder="Akosua Textiles Ltd"
                value={form.businessName} onChange={handleChange} className="input" required />
            </div>
            <div>
              <label className="label" htmlFor="registrationNumber">Registration number</label>
              <input id="registrationNumber" name="registrationNumber" type="text" placeholder="GH-BIZ-XXXXXXXX"
                value={form.registrationNumber} onChange={handleChange} className="input" required />
            </div>
          </>
        )}

        {error && <div className="alert-error">{error}</div>}

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-500">
        Already have an account?{' '}
        <Link href="/login" className="text-gold-700 hover:underline font-medium">
          Sign in
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
