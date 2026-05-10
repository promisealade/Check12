'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../lib/api/client';

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

export default function KycPage() {
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState<'kyc' | 'kyb'>('kyc');
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const { data: kycStatus } = useQuery<KycStatusResponse>({
    queryKey: ['kyc-status'],
    queryFn: async () => (await apiClient.get('/kyc/status')).data,
  });

  const { data: kybStatus } = useQuery<KybStatusResponse>({
    queryKey: ['kyb-status'],
    queryFn: async () => (await apiClient.get('/kyb/status')).data,
  });

  const submitKyc = useMutation({
    mutationFn: (documentType: DocType) =>
      apiClient.post('/kyc/submit', { documentType }),
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
      apiClient.post('/kyb/submit', { documentType }),
    onSuccess: (res) => {
      setMessage(res.data.message);
      setError('');
      qc.invalidateQueries({ queryKey: ['kyb-status'] });
    },
    onError: (err: any) => setError(err.response?.data?.detail ?? 'Submission failed'),
    onSettled: () => setSubmitting(null),
  });

  const approvedTypes = kycStatus?.documents
    .filter((d) => d.status === 'approved')
    .map((d) => d.documentType) ?? [];

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Identity Verification</h1>
        <p className="text-gray-500 text-sm mt-1">
          Complete verification to unlock higher transaction limits
        </p>
      </div>

      {/* Tier progress */}
      <div className="card space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-800">Current tier</h2>
          <TierBadge tier={kycStatus?.tier ?? 0} />
        </div>

        <div className="space-y-2">
          {[
            { tier: 0, label: 'Tier 0 — Registered', detail: 'No verification required', limit: '$0 / day' },
            { tier: 1, label: 'Tier 1 — Verified', detail: 'Primary ID approved', limit: '$500 / day' },
            { tier: 2, label: 'Tier 2 — Full KYC', detail: 'Primary ID + selfie', limit: '$5,000 / day' },
          ].map(({ tier, label, detail, limit }) => {
            const current = kycStatus?.tier ?? 0;
            const done = current >= tier;
            return (
              <div
                key={tier}
                className={`flex items-center gap-3 p-3 rounded-lg border ${
                  done ? 'border-brand-200 bg-brand-50' : 'border-gray-100 bg-gray-50'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${
                    done ? 'bg-brand-600 text-white' : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {done ? '✓' : tier}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800">{label}</p>
                  <p className="text-xs text-gray-500">{detail}</p>
                </div>
                <span className="text-xs text-gray-400">{limit}</span>
              </div>
            );
          })}
        </div>

        {kycStatus?.nextStep && (
          <div className="rounded-md bg-amber-50 border border-amber-200 px-4 py-2 text-sm text-amber-700">
            Next: {kycStatus.nextStep}
          </div>
        )}
      </div>

      {/* Tab: KYC / KYB */}
      <div className="flex rounded-lg overflow-hidden border border-gray-200">
        {(['kyc', 'kyb'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 text-sm font-medium uppercase tracking-wide transition-colors ${
              activeTab === tab ? 'bg-brand-600 text-white' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            {tab === 'kyc' ? 'Individual KYC' : 'Business KYB'}
          </button>
        ))}
      </div>

      {message && (
        <div className="rounded-md bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
          {message}
        </div>
      )}
      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {activeTab === 'kyc' && (
        <div className="space-y-3">
          {INDIVIDUAL_DOCS.map(({ type, label, description }) => {
            const isApproved = approvedTypes.includes(type);
            const isLoading = submitting === type;
            return (
              <div key={type} className="card flex items-center gap-4">
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{label}</p>
                  <p className="text-xs text-gray-500">{description}</p>
                </div>
                {isApproved ? (
                  <span className="badge-success">Approved</span>
                ) : (
                  <button
                    onClick={() => {
                      setSubmitting(type);
                      setMessage('');
                      setError('');
                      submitKyc.mutate(type);
                    }}
                    disabled={isLoading}
                    className="btn-primary text-sm py-1.5 px-4"
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
            <div className="rounded-md bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700 font-medium">
              Business fully verified (KYB approved)
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
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{label}</p>
                  <p className="text-xs text-gray-500">{description}</p>
                </div>
                {isApproved ? (
                  <span className="badge-success">Approved</span>
                ) : (
                  <button
                    onClick={() => {
                      setSubmitting(type);
                      setMessage('');
                      setError('');
                      submitKyb.mutate(type);
                    }}
                    disabled={isLoading}
                    className="btn-primary text-sm py-1.5 px-4"
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
    0: 'bg-gray-100 text-gray-600',
    1: 'bg-amber-100 text-amber-700',
    2: 'bg-green-100 text-green-700',
  };
  return (
    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${styles[tier] ?? styles[0]}`}>
      Tier {tier}
    </span>
  );
}
