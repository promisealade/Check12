'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuthStore } from '../../lib/stores/auth.store';
import { useAuth } from '../../lib/hooks/useAuth';

const ADMIN_LINKS = [
  { href: '/admin/metrics', label: 'Metrics', icon: '📊' },
  { href: '/admin/kyc', label: 'KYC Queue', icon: '🪪' },
  { href: '/admin/aml', label: 'AML Alerts', icon: '🚨' },
  { href: '/admin/reserves', label: 'Reserves', icon: '🏅' },
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
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gray-900 text-white sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/metrics" className="flex items-center gap-2">
              <Image src="/logo-square.png" alt="AfriOne" width={26} height={26} className="rounded-sm brightness-0 invert" />
              <span className="font-bold text-white text-lg tracking-tight">AfriOne Admin</span>
            </Link>
            <span className="text-xs bg-amber-500 text-gray-900 font-semibold px-2 py-0.5 rounded">
              ADMIN
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/wallet" className="text-sm text-gray-400 hover:text-white transition-colors">
              ← User view
            </Link>
            <button onClick={logout} className="text-sm text-gray-400 hover:text-white transition-colors">
              Sign out
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto flex">
        <nav className="hidden md:flex flex-col w-52 py-6 px-3 gap-1 shrink-0">
          {ADMIN_LINKS.map(({ href, label, icon }) => {
            const active = pathname === href || pathname.startsWith(href + '/');
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  active
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span className="text-base">{icon}</span>
                {label}
              </Link>
            );
          })}
        </nav>

        <main className="flex-1 min-w-0">{children}</main>
      </div>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-700 flex">
        {ADMIN_LINKS.map(({ href, label, icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex-1 flex flex-col items-center py-2 text-xs gap-0.5 ${
                active ? 'text-white' : 'text-gray-500'
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
