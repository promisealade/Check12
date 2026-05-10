'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../lib/api/client';

interface KycQueueItem {
  docId: string;
  userId: string;
  email: string;
  phone: string;
  documentType: string;
  submittedAt: string;
}

export default function AdminKycPage() {
  const qc = useQueryClient();
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const { data: queue = [], isLoading } = useQuery<KycQueueItem[]>({
    queryKey: ['admin-kyc-queue'],
    queryFn: async () => (await apiClient.get('/admin/kyc-queue')).data,
  });

  const review = useMutation({
    mutationFn: ({ docId, decision, notes }: { docId: string; decision: 'approved' | 'rejected'; notes?: string }) =>
      apiClient.post(`/admin/kyc/${docId}/review`, { decision, notes }),
    onSuccess: (_, vars) => {
      setMessage(`Document ${vars.decision}`);
      setError('');
      qc.invalidateQueries({ queryKey: ['admin-kyc-queue'] });
      qc.invalidateQueries({ queryKey: ['admin-metrics'] });
    },
    onError: (err: any) => setError(err.response?.data?.detail ?? 'Review failed'),
  });

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">KYC Review Queue</h1>
        <p className="text-gray-500 text-sm mt-1">{queue.length} documents pending review</p>
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

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : queue.length === 0 ? (
        <div className="card text-center py-12 text-gray-400">
          No documents pending review ✓
        </div>
      ) : (
        <div className="space-y-3">
          {queue.map((item) => (
            <div key={item.docId} className="card flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-medium text-gray-800">{item.email}</p>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                    {item.documentType.replace(/_/g, ' ')}
                  </span>
                </div>
                <p className="text-xs text-gray-400">
                  {item.phone} · Submitted {new Date(item.submittedAt).toLocaleString()}
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  className="text-sm px-3 py-1.5 rounded-lg border border-green-300 text-green-700 hover:bg-green-50 transition-colors"
                  disabled={review.isPending}
                  onClick={() => review.mutate({ docId: item.docId, decision: 'approved' })}
                >
                  Approve
                </button>
                <button
                  className="text-sm px-3 py-1.5 rounded-lg border border-red-300 text-red-700 hover:bg-red-50 transition-colors"
                  disabled={review.isPending}
                  onClick={() => review.mutate({ docId: item.docId, decision: 'rejected' })}
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
