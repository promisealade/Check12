'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { apiClient } from '../../../lib/api/client';

interface Notification {
  id: string;
  type: string;
  message: string;
  read: boolean;
  actionUrl: string | null;
  createdAt: string;
}

const TYPE_ICONS: Record<string, string> = {
  transfer_received: '💸',
  payment_collected: '🧾',
  kyc_approved: '✅',
  kyc_rejected: '❌',
  conversion_complete: '🔄',
  new_device_login: '🔔',
  funding_complete: '💰',
  withdrawal_complete: '📤',
};

export default function NotificationsPage() {
  const qc = useQueryClient();

  const { data } = useQuery<{ notifications: Notification[]; unreadCount: number }>({
    queryKey: ['notifications'],
    queryFn: async () => (await apiClient.get('/notifications')).data,
  });

  const markRead = useMutation({
    mutationFn: (id: string) => apiClient.patch(`/notifications/${id}/read`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const markAllRead = useMutation({
    mutationFn: () => apiClient.post('/notifications/read-all'),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const notifications = data?.notifications ?? [];
  const unreadCount = data?.unreadCount ?? 0;

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          {unreadCount > 0 && (
            <p className="text-sm text-gray-500 mt-0.5">{unreadCount} unread</p>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={() => markAllRead.mutate()}
            className="btn-secondary text-sm"
            disabled={markAllRead.isPending}
          >
            Mark all read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="card text-center py-12 text-gray-400 text-sm">
          No notifications yet
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => {
            const icon = TYPE_ICONS[n.type] ?? '🔔';
            const content = (
              <div
                key={n.id}
                className={`flex items-start gap-3 px-4 py-3 rounded-xl border transition-colors cursor-pointer ${
                  n.read
                    ? 'bg-white border-gray-100 hover:border-gray-200'
                    : 'bg-brand-50 border-brand-100 hover:border-brand-200'
                }`}
                onClick={() => !n.read && markRead.mutate(n.id)}
              >
                <span className="text-2xl mt-0.5">{icon}</span>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${n.read ? 'text-gray-600' : 'text-gray-800 font-medium'}`}>
                    {n.message}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(n.createdAt).toLocaleString()}
                  </p>
                </div>
                {!n.read && (
                  <div className="w-2 h-2 bg-brand-500 rounded-full mt-1.5 shrink-0" />
                )}
              </div>
            );

            return n.actionUrl ? (
              <Link key={n.id} href={n.actionUrl}>
                {content}
              </Link>
            ) : (
              <div key={n.id}>{content}</div>
            );
          })}
        </div>
      )}
    </div>
  );
}
