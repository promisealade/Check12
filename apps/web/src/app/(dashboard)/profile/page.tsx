'use client';

import { useAuthStore } from '../../../lib/stores/auth.store';
import { Icon } from '../../../lib/icons';
import { useAuth } from '../../../lib/hooks/useAuth';

const KYC_TIER_LABELS: Record<number, string> = {
  0: 'Unverified',
  1: 'Tier 1 — Basic',
  2: 'Tier 2 — Full',
};

const KYC_STATUS_LABELS: Record<string, string> = {
  pending: 'Pending review',
  approved: 'Approved',
  rejected: 'Rejected',
  requires_more_info: 'More info required',
};

const KYC_STATUS_STYLES: Record<string, string> = {
  pending: 'bg-sand-100 text-gold-700',
  approved: 'bg-sage-100 text-brand-700',
  rejected: 'bg-red-50 text-red-600',
  requires_more_info: 'bg-sand-100 text-gold-700',
};

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const { logout } = useAuth();

  if (!user) return null;

  const displayName = user.email
    ? user.email[0].toUpperCase() + user.email.split('@')[0].slice(1)
    : user.phone;

  const accountTypeLabel = user.type === 'business' ? 'Business' : 'Personal';
  const tierLabel = KYC_TIER_LABELS[user.tier] ?? `Tier ${user.tier}`;
  const statusLabel = KYC_STATUS_LABELS[user.kycStatus] ?? user.kycStatus;
  const statusStyle = KYC_STATUS_STYLES[user.kycStatus] ?? 'bg-muted-100 text-muted-500';

  const memberSince = new Date(user.createdAt).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="w-full py-8 px-4 lg:px-8 max-w-2xl mx-auto space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-display font-semibold text-brand-700 tracking-tight">Profile</h1>
        <p className="text-sm text-muted-500 mt-1">Your account details and verification status</p>
      </div>

      {/* Avatar + name */}
      <div className="bg-white rounded-[28px] p-6 ring-1 ring-muted-100 shadow-card flex items-center gap-5">
        <div className="w-16 h-16 rounded-full bg-brand-50 text-brand-700 flex items-center justify-center shrink-0">
          <span className="font-display font-semibold text-2xl">{displayName[0]}</span>
        </div>
        <div className="min-w-0">
          <p className="font-display font-semibold text-brand-700 text-xl truncate">{displayName}</p>
          <p className="text-sm text-muted-500 mt-0.5 truncate">{user.email || user.phone}</p>
          {user.role === 'admin' && (
            <span className="inline-flex items-center gap-1 mt-1.5 text-xs font-semibold uppercase tracking-wider text-gold-700 bg-sand-100 px-2 py-0.5 rounded-full">
              Admin
            </span>
          )}
        </div>
      </div>

      {/* Personal information */}
      <Section title="Personal information" icon="user">
        <Row label="Full name / Handle" value={displayName} />
        <Row label="Email" value={user.email || '—'} />
        <Row label="Phone" value={user.phone} />
        <Row label="Member since" value={memberSince} />
      </Section>

      {/* Account type */}
      <Section title="Account type" icon="id">
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center gap-3">
            <span className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
              user.type === 'business' ? 'bg-sand-100 text-gold-700' : 'bg-sage-100 text-brand-700'
            }`}>
              <Icon name={user.type === 'business' ? 'bank' : 'user'} className="w-5 h-5" />
            </span>
            <div>
              <p className="font-medium text-brand-700">{accountTypeLabel} account</p>
              {user.type === 'business' && user.businessName && (
                <p className="text-sm text-muted-500">{user.businessName}</p>
              )}
            </div>
          </div>
        </div>
        {user.type === 'business' && user.registrationNumber && (
          <Row label="Registration number" value={user.registrationNumber} />
        )}
      </Section>

      {/* Verification status */}
      <Section title="Verification status" icon="shieldCheck">
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center gap-3">
            <span className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
              user.tier >= 2 ? 'bg-sage-100 text-brand-700' : 'bg-sand-100 text-gold-700'
            }`}>
              <Icon name={user.tier >= 2 ? 'shieldCheck' : 'shield'} className="w-5 h-5" />
            </span>
            <div>
              <p className="font-medium text-brand-700">{tierLabel}</p>
              <p className="text-sm text-muted-500">KYC verification level</p>
            </div>
          </div>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusStyle}`}>
            {statusLabel}
          </span>
        </div>

        {/* Tier progress */}
        <div className="mt-1 mb-2 space-y-2">
          {[
            { tier: 1, label: 'Tier 1 · Phone & ID', limit: 'Up to GHS 5,000 / month' },
            { tier: 2, label: 'Tier 2 · Enhanced KYC', limit: 'Unlimited transactions' },
          ].map(({ tier, label, limit }) => {
            const done = user.tier >= tier;
            return (
              <div key={tier} className={`flex items-center gap-3 rounded-xl p-3 ${done ? 'bg-sage-50 ring-1 ring-sage-100' : 'bg-muted-50 ring-1 ring-muted-100'}`}>
                <span className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${done ? 'bg-brand-600 text-white' : 'bg-muted-200 text-muted-400'}`}>
                  {done ? <Icon name="check" className="w-3.5 h-3.5" /> : <span className="text-xs font-bold">{tier}</span>}
                </span>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${done ? 'text-brand-700' : 'text-muted-500'}`}>{label}</p>
                  <p className="text-xs text-muted-400">{limit}</p>
                </div>
              </div>
            );
          })}
        </div>

        {user.tier < 2 && (
          <a
            href="/kyc"
            className="flex items-center justify-center gap-2 w-full mt-2 py-2.5 rounded-xl bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 transition-colors"
          >
            <Icon name="arrowUpRight" className="w-4 h-4" />
            Complete verification
          </a>
        )}
      </Section>

      {/* Sign out */}
      <div className="pt-2 pb-8">
        <button
          onClick={logout}
          className="flex items-center gap-2 text-sm text-muted-500 hover:text-red-600 transition-colors"
        >
          <Icon name="logout" className="w-4 h-4" />
          Sign out
        </button>
      </div>
    </div>
  );
}

function Section({ title, icon, children }: {
  title: string;
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-[28px] ring-1 ring-muted-100 shadow-card overflow-hidden">
      <div className="flex items-center gap-2.5 px-6 py-4 border-b border-muted-100">
        <Icon name={icon as Parameters<typeof Icon>[0]['name']} className="w-4 h-4 text-muted-400" />
        <h2 className="text-sm font-semibold text-muted-600 uppercase tracking-wider">{title}</h2>
      </div>
      <div className="px-6 divide-y divide-muted-100/70">{children}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-3 gap-4">
      <p className="text-sm text-muted-500 shrink-0">{label}</p>
      <p className="text-sm font-medium text-brand-700 text-right truncate">{value}</p>
    </div>
  );
}
