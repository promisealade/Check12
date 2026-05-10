'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { apiClient } from '../../../lib/api/client';
import { Icon, type IconName } from '../../../lib/icons';

interface Notification {
  id: string;
  type: string;
  message: string;
  read: boolean;
  actionUrl: string | null;
  createdAt: string;
}

const TYPE_ICONS: Record<string, { icon: IconName; bg: string; color: string }> = {
  transfer_received: { icon: 'arrowDownLeft', bg: 'bg-success-50', color: 'text-success-700' },
  transfer_sent: { icon: 'arrowUpRight', bg: 'bg-warn-50', color: 'text-warn-700' },
  payment_collected: { icon: 'receipt', bg: 'bg-brand-50', color: 'text-brand-600' },
  kyc_approved: { icon: 'checkCircle', bg: 'bg-success-50', color: 'text-success-700' },
  kyc_rejected: { icon: 'xCircle', bg: 'bg-danger-50', color: 'text-danger-700' },
  conversion_complete: { icon: 'swap', bg: 'bg-brand-50', color: 'text-brand-600' },
  new_device_login: { icon: 'bell', bg: 'bg-warn-50', color: 'text-warn-700' },
  funding_complete: { icon: 'plusCircle', bg: 'bg-gold-100', color: 'text-gold-500' },
  withdrawal_complete: { icon: 'arrowUpRight', bg: 'bg-warn-50', color: 'text-warn-700' },
};

export default function NotificationsPage() {
  const qc = useQueryClient();

  const { data } = useQuery<{ notifications: Notification[]; unreadCount: number }>({
    queryKey: ['notifications'],
    queryFn: async () => (await apiClient.get<{ notifications: Notification[]; unreadCount: number }>('/notifications')).data,
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
          <h1 className="h1">Notifications</h1>
          {unreadCount > 0 && <p className="subtle mt-1">{unreadCount} unread</p>}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={() => markAllRead.mutate()}
            className="btn-secondary text-sm"
            disabled={markAllRead.isPending}
          >
            <Icon name="check" className="w-4 h-4" /> Mark all read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="card text-center py-12 space-y-3">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center">
            <Icon name="bell" className="w-6 h-6" />
          </div>
          <p className="text-sm text-muted-500">No notifications yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => {
            const config = TYPE_ICONS[n.type] ?? { icon: 'bell' as IconName, bg: 'bg-muted-100', color: 'text-muted-500' };
            const content = (
              <div
                className={`flex items-start gap-3 px-4 py-3.5 rounded-2xl border transition-colors cursor-pointer ${
                  n.read
                    ? 'bg-white border-muted-100 hover:border-muted-200'
                    : 'bg-brand-50/40 border-brand-100 hover:border-brand-200'
                }`}
                onClick={() => !n.read && markRead.mutate(n.id)}
              >
                <div className={`w-10 h-10 rounded-2xl ${config.bg} ${config.color} flex items-center justify-center shrink-0`}>
                  <Icon name={config.icon} className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${n.read ? 'text-muted-600' : 'text-brand-700 font-medium'}`}>
                    {n.message}
                  </p>
                  <p className="text-xs text-muted-400 mt-0.5">
                    {new Date(n.createdAt).toLocaleString()}
                  </p>
                </div>
                {!n.read && <div className="w-2 h-2 bg-brand-500 rounded-full mt-2 shrink-0" />}
              </div>
            );

            return n.actionUrl ? (
              <Link key={n.id} href={n.actionUrl}>{content}</Link>
            ) : (
              <div key={n.id}>{content}</div>
            );
          })}
        </div>
      )}
    </div>
  );
}
