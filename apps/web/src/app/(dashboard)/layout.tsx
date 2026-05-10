'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../lib/stores/auth.store';
import { apiClient } from '../../lib/api/client';
import { useAuth } from '../../lib/hooks/useAuth';
import { Icon, type IconName } from '../../lib/icons';
import type { User } from '../../lib/stores/auth.store';

type Nav = { href: string; label: string; icon: IconName };

const INDIVIDUAL_NAV: Nav[] = [
  { href: '/wallet', label: 'Home', icon: 'wallet' },
  { href: '/transfer', label: 'Send', icon: 'send' },
  { href: '/convert', label: 'Convert', icon: 'swap' },
  { href: '/collections', label: 'Collect', icon: 'collect' },
  { href: '/savings', label: 'Save', icon: 'bank' },
  { href: '/profile', label: 'Profile', icon: 'user' },
];

const BUSINESS_NAV: Nav[] = [
  { href: '/wallet', label: 'Home', icon: 'wallet' },
  { href: '/collections', label: 'Collect', icon: 'collect' },
  { href: '/transfer', label: 'Send', icon: 'send' },
  { href: '/convert', label: 'Convert', icon: 'swap' },
  { href: '/savings', label: 'Save', icon: 'bank' },
  { href: '/profile', label: 'Profile', icon: 'user' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, setUser, isAuthenticated } = useAuthStore();
  const { logout } = useAuth();
  const isBusiness = user?.type === 'business';
  const NAV_LINKS = isBusiness ? BUSINESS_NAV : INDIVIDUAL_NAV;

  const { data: profile } = useQuery({
    queryKey: ['user-me'],
    queryFn: async () => (await apiClient.get<User>('/users/me')).data,
    enabled: !user,
    retry: false,
  });

  useEffect(() => {
    if (profile) setUser(profile);
  }, [profile, setUser]);

  useEffect(() => {
    const timer = !isAuthenticated && !profile
      ? setTimeout(() => router.replace('/login'), 1500)
      : null;
    return () => { if (timer) clearTimeout(timer); };
  }, [isAuthenticated, profile, router]);

  const { data: notifData } = useQuery<{ unreadCount: number }>({
    queryKey: ['notifications-count'],
    queryFn: async () => (await apiClient.get<{ unreadCount: number }>('/notifications')).data,
    refetchInterval: 60_000,
    enabled: isAuthenticated || !!profile,
  });

  return (
    <div className="min-h-screen bg-parchment pb-20 md:pb-0">
      <header className="bg-parchment/85 backdrop-blur sticky top-0 z-10 border-b border-muted-100/70">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/wallet" className="flex items-center gap-2">
            <BrandMark className="w-7 h-7 text-gold-500" />
            <span className="font-display font-semibold text-brand-700 text-lg tracking-tight">Afrione</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href="/notifications"
              className="relative w-9 h-9 rounded-full hover:bg-white flex items-center justify-center text-muted-500 hover:text-brand-700 transition-colors"
              aria-label="Notifications"
            >
              <Icon name="bell" className="w-[18px] h-[18px]" />
              {(notifData?.unreadCount ?? 0) > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-gold-500 text-white text-[10px] font-semibold w-4 h-4 rounded-full flex items-center justify-center">
                  {notifData!.unreadCount > 9 ? '9+' : notifData!.unreadCount}
                </span>
              )}
            </Link>
            {user?.role === 'admin' && (
              <Link
                href="/admin/metrics"
                className="hidden sm:inline-flex text-xs font-semibold uppercase tracking-wider text-gold-700 bg-sand-100 px-2.5 py-1 rounded-full"
              >
                Admin
              </Link>
            )}
            <button
              onClick={logout}
              className="w-9 h-9 rounded-full hover:bg-white flex items-center justify-center text-muted-500 hover:text-brand-700 transition-colors"
              aria-label="Sign out"
              title="Sign out"
            >
              <Icon name="logout" className="w-[18px] h-[18px]" />
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
                    ? 'bg-white text-brand-700 shadow-pop ring-1 ring-muted-100'
                    : 'text-muted-600 hover:bg-white/60 hover:text-brand-700'
                }`}
              >
                <Icon name={icon} className="w-[18px] h-[18px]" />
                {label}
              </Link>
            );
          })}
        </nav>

        <main className="flex-1 min-w-0">{children}</main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-muted-100 flex z-10">
        {NAV_LINKS.map(({ href, label, icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              className={`flex-1 flex flex-col items-center py-2 text-[11px] gap-0.5 ${
                active ? 'text-brand-700' : 'text-muted-400'
              }`}
            >
              <Icon name={icon} className="w-[20px] h-[20px]" />
              {label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

function BrandMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth={1.6} className={className}>
      <g strokeLinecap="round" strokeLinejoin="round">
        {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
          <ellipse key={deg} cx="16" cy="9" rx="2.6" ry="6" transform={`rotate(${deg} 16 16)`} />
        ))}
        <circle cx="16" cy="16" r="2" fill="currentColor" stroke="none" />
      </g>
    </svg>
  );
}
