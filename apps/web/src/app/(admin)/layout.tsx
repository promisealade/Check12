'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuthStore } from '../../lib/stores/auth.store';
import { useAuth } from '../../lib/hooks/useAuth';
import { Icon, type IconName } from '../../lib/icons';

type Nav = { href: string; label: string; icon: IconName };

const ADMIN_LINKS: Nav[] = [
  { href: '/admin/metrics', label: 'Metrics', icon: 'trending' },
  { href: '/admin/kyc', label: 'KYC Queue', icon: 'id' },
  { href: '/admin/aml', label: 'AML Alerts', icon: 'alert' },
  { href: '/admin/reserves', label: 'Reserves', icon: 'shieldCheck' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuthStore();
  const { logout } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }
    if (user && user.role !== 'admin') {
      router.replace('/wallet');
    }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated || (user && user.role !== 'admin')) {
    return null;
  }

  return (
    <div className="min-h-screen bg-parchment pb-20 md:pb-0">
      <header className="bg-brand-700 text-white sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin/metrics" className="flex items-center gap-2">
              <BrandMark className="w-7 h-7 text-gold-300" />
              <span className="font-semibold text-white text-lg tracking-tight">Afrione</span>
            </Link>
            <span className="text-[10px] tracking-[0.12em] uppercase bg-gold-400 text-brand-900 font-bold px-2 py-0.5 rounded">
              Admin
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/wallet"
              className="hidden sm:inline-flex items-center gap-1.5 text-sm text-brand-100 hover:text-white transition-colors px-3 py-1.5 rounded-full hover:bg-white/10"
            >
              <Icon name="back" className="w-4 h-4" />
              User view
            </Link>
            <button
              onClick={logout}
              className="w-9 h-9 rounded-full hover:bg-white/10 flex items-center justify-center text-brand-100 hover:text-white transition-colors"
              aria-label="Sign out"
              title="Sign out"
            >
              <Icon name="logout" className="w-[18px] h-[18px]" />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto flex">
        <nav className="hidden md:flex flex-col w-56 py-6 px-3 gap-1 shrink-0">
          {ADMIN_LINKS.map(({ href, label, icon }) => {
            const active = pathname === href || pathname.startsWith(href + '/');
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  active
                    ? 'bg-brand-700 text-white shadow-[0_1px_2px_rgba(0,0,0,0.1)]'
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

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-brand-700 border-t border-brand-800 flex z-10">
        {ADMIN_LINKS.map(({ href, label, icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              className={`flex-1 flex flex-col items-center py-2 text-[11px] gap-0.5 ${
                active ? 'text-gold-300' : 'text-brand-200/70'
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
