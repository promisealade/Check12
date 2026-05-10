'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../lib/stores/auth.store';
import { apiClient } from '../../lib/api/client';
import { useAuth } from '../../lib/hooks/useAuth';

const NAV_LINKS = [
  { href: '/wallet', label: 'Wallet', icon: '💳' },
  { href: '/transfer', label: 'Send', icon: '→' },
  { href: '/convert', label: 'Convert', icon: '⇄' },
  { href: '/collections', label: 'Collect', icon: '🧾' },
  { href: '/savings', label: 'Save', icon: '🏦' },
  { href: '/kyc', label: 'Verify', icon: '🪪' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, setUser, isAuthenticated } = useAuthStore();
  const { logout } = useAuth();

  // Hydrate user profile on mount
  const { data: profile } = useQuery({
    queryKey: ['user-me'],
    queryFn: async () => (await apiClient.get('/users/me')).data,
    enabled: !user,
    retry: false,
  });

  useEffect(() => {
    if (profile) setUser(profile);
  }, [profile, setUser]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated && !profile) {
      const timer = setTimeout(() => router.replace('/login'), 1500);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, profile, router]);

  // Notifications unread count
  const { data: notifData } = useQuery<{ unreadCount: number }>({
    queryKey: ['notifications-count'],
    queryFn: async () => (await apiClient.get('/notifications')).data,
    refetchInterval: 60_000,
    enabled: isAuthenticated || !!profile,
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top nav */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/wallet" className="font-bold text-brand-600 text-lg">
            Check12
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/notifications" className="relative text-gray-400 hover:text-gray-600">
              🔔
              {(notifData?.unreadCount ?? 0) > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {notifData!.unreadCount > 9 ? '9+' : notifData!.unreadCount}
                </span>
              )}
            </Link>
            {user?.role === 'admin' && (
              <Link href="/admin/metrics" className="text-sm text-gray-500 hover:text-gray-700">
                Admin
              </Link>
            )}
            <button onClick={logout} className="text-sm text-gray-400 hover:text-gray-600">
              Sign out
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto flex">
        {/* Sidebar */}
        <nav className="hidden md:flex flex-col w-52 py-6 px-3 gap-1 shrink-0">
          {NAV_LINKS.map(({ href, label, icon }) => {
            const active = pathname === href || pathname.startsWith(href + '/');
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  active
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span className="text-base">{icon}</span>
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Main content */}
        <main className="flex-1 min-w-0">{children}</main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex">
        {NAV_LINKS.slice(0, 5).map(({ href, label, icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex-1 flex flex-col items-center py-2 text-xs gap-0.5 ${
                active ? 'text-brand-600' : 'text-gray-400'
              }`}
            >
              <span className="text-xl">{icon}</span>
              {label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
