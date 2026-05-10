'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../lib/api/client';
import { Icon } from '../../../lib/icons';

type DocType = 'national_id' | 'passport' | 'drivers_license' | 'selfie';
type KybDocType = 'business_registration' | 'director_id';

interface KycStatusResponse {
  tier: number;
  kycStatus: string;
  documents: Array<{ id: string; documentType: string; status: string; submittedAt: string }>;
  nextStep: string | null;
  tierRequirements: {
    tier1: { met: boolean; requirement: string };
    tier2: { met: boolean; requirement: string };
  };
}

interface KybStatusResponse {
  kybStatus: string;
  businessName: string;
  requirements: {
    businessRegistration: { met: boolean; requirement: string };
    directorId: { met: boolean; requirement: string };
  };
}

const INDIVIDUAL_DOCS: Array<{ type: DocType; label: string; description: string }> = [
  { type: 'national_id', label: 'National ID', description: 'Ghana Card or equivalent' },
  { type: 'passport', label: 'Passport', description: 'International travel passport' },
  { type: 'drivers_license', label: "Driver's License", description: 'Valid driving licence' },
  { type: 'selfie', label: 'Selfie / Liveness', description: 'Face verification photo' },
];

const BUSINESS_DOCS: Array<{ type: KybDocType; label: string; description: string }> = [
  { type: 'business_registration', label: 'Certificate of Incorporation', description: 'Registered company document' },
  { type: 'director_id', label: 'Director ID', description: 'National ID or passport of director' },
];

const TIER_INFO = [
  { tier: 0, label: 'Tier 0 — Registered', detail: 'No verification required', limit: '$0 / day' },
  { tier: 1, label: 'Tier 1 — Verified', detail: 'Primary ID approved', limit: '$500 / day' },
  { tier: 2, label: 'Tier 2 — Full KYC', detail: 'Primary ID + selfie', limit: '$5,000 / day' },
];

export default function KycPage() {
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState<'kyc' | 'kyb'>('kyc');
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const { data: kycStatus } = useQuery<KycStatusResponse>({
    queryKey: ['kyc-status'],
    queryFn: async () => (await apiClient.get<KycStatusResponse>('/kyc/status')).data,
  });

  const { data: kybStatus } = useQuery<KybStatusResponse>({
    queryKey: ['kyb-status'],
    queryFn: async () => (await apiClient.get<KybStatusResponse>('/kyb/status')).data,
  });

  const submitKyc = useMutation({
    mutationFn: (documentType: DocType) =>
      apiClient.post<{ message: string }>('/kyc/submit', { documentType }),
    onSuccess: (res) => {
      setMessage(res.data.message);
      setError('');
      qc.invalidateQueries({ queryKey: ['kyc-status'] });
    },
    onError: (err: any) => setError(err.response?.data?.detail ?? 'Submission failed'),
    onSettled: () => setSubmitting(null),
  });

  const submitKyb = useMutation({
    mutationFn: (documentType: KybDocType) =>
      apiClient.post<{ message: string }>('/kyb/submit', { documentType }),
    onSuccess: (res) => {
      setMessage(res.data.message);
      setError('');
      qc.invalidateQueries({ queryKey: ['kyb-status'] });
    },
    onError: (err: any) => setError(err.response?.data?.detail ?? 'Submission failed'),
    onSettled: () => setSubmitting(null),
  });

  const approvedTypes = kycStatus?.documents.filter((d) => d.status === 'approved').map((d) => d.documentType) ?? [];

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 space-y-6">
      <div>
        <h1 className="h1">Identity verification</h1>
        <p className="subtle mt-1">Complete verification to unlock higher transaction limits.</p>
      </div>

      <div className="card space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-brand-700">Current tier</h2>
          <TierBadge tier={kycStatus?.tier ?? 0} />
        </div>

        <div className="space-y-2">
          {TIER_INFO.map(({ tier, label, detail, limit }) => {
            const current = kycStatus?.tier ?? 0;
            const done = current >= tier;
            return (
              <div
                key={tier}
                className={`flex items-center gap-3 p-3 rounded-2xl border ${
                  done ? 'border-brand-200 bg-brand-50' : 'border-muted-100 bg-parchment/60'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-semibold ${
                    done ? 'bg-brand-600 text-white' : 'bg-muted-200 text-muted-500'
                  }`}
                >
                  {done ? <Icon name="check" className="w-4 h-4" /> : tier}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-brand-700">{label}</p>
                  <p className="text-xs text-muted-500">{detail}</p>
                </div>
                <span className="text-xs font-medium text-muted-500 tabular-nums">{limit}</span>
              </div>
            );
          })}
        </div>

        {kycStatus?.nextStep && (
          <div className="alert-warning flex items-start gap-2">
            <Icon name="warning" className="w-4 h-4 mt-0.5 shrink-0" />
            <span><span className="font-medium">Next:</span> {kycStatus.nextStep}</span>
          </div>
        )}
      </div>

      {/* Tab: KYC / KYB */}
      <div className="rounded-2xl bg-white border border-muted-100 p-1 flex">
        {(['kyc', 'kyb'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 text-sm font-medium rounded-xl transition-colors ${
              activeTab === tab
                ? 'bg-brand-50 text-brand-700'
                : 'text-muted-500 hover:text-muted-700'
            }`}
          >
            {tab === 'kyc' ? 'Individual KYC' : 'Business KYB'}
          </button>
        ))}
      </div>

      {message && <div className="alert-success">{message}</div>}
      {error && <div className="alert-error">{error}</div>}

      {activeTab === 'kyc' && (
        <div className="space-y-3">
          {INDIVIDUAL_DOCS.map(({ type, label, description }) => {
            const isApproved = approvedTypes.includes(type);
            const isLoading = submitting === type;
            return (
              <div key={type} className="card flex items-center gap-4">
                <div className="w-11 h-11 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
                  <Icon name="id" className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-brand-700">{label}</p>
                  <p className="text-xs text-muted-500">{description}</p>
                </div>
                {isApproved ? (
                  <span className="badge-success">
                    <Icon name="check" className="w-3 h-3 mr-1" />
                    Approved
                  </span>
                ) : (
                  <button
                    onClick={() => {
                      setSubmitting(type);
                      setMessage('');
                      setError('');
                      submitKyc.mutate(type);
                    }}
                    disabled={isLoading}
                    className="btn-primary text-sm py-2 px-4"
                  >
                    {isLoading ? 'Submitting…' : 'Submit'}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'kyb' && (
        <div className="space-y-3">
          {kybStatus?.kybStatus === 'approved' && (
            <div className="alert-success flex items-center gap-2 font-medium">
              <Icon name="checkCircle" className="w-4 h-4" />
              Business fully verified
            </div>
          )}
          {BUSINESS_DOCS.map(({ type, label, description }) => {
            const req =
              type === 'business_registration'
                ? kybStatus?.requirements.businessRegistration
                : kybStatus?.requirements.directorId;
            const isApproved = req?.met ?? false;
            const isLoading = submitting === type;
            return (
              <div key={type} className="card flex items-center gap-4">
                <div className="w-11 h-11 rounded-2xl bg-gold-100 text-gold-500 flex items-center justify-center shrink-0">
                  <Icon name="receipt" className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-brand-700">{label}</p>
                  <p className="text-xs text-muted-500">{description}</p>
                </div>
                {isApproved ? (
                  <span className="badge-success">
                    <Icon name="check" className="w-3 h-3 mr-1" />
                    Approved
                  </span>
                ) : (
                  <button
                    onClick={() => {
                      setSubmitting(type);
                      setMessage('');
                      setError('');
                      submitKyb.mutate(type);
                    }}
                    disabled={isLoading}
                    className="btn-primary text-sm py-2 px-4"
                  >
                    {isLoading ? 'Submitting…' : 'Submit'}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function TierBadge({ tier }: { tier: number }) {
  const styles: Record<number, string> = {
    0: 'bg-muted-100 text-muted-600',
    1: 'bg-gold-100 text-gold-500',
    2: 'bg-brand-100 text-brand-700',
  };
  return (
    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${styles[tier] ?? styles[0]}`}>
      Tier {tier}
    </span>
  );
}
