import Link from 'next/link';
import { Icon } from '../icons';

export function BrandMark({ className }: { className?: string }) {
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

export function Footer() {
  return (
    <footer className="border-t border-muted-100 bg-parchment/60">
      <div className="max-w-6xl mx-auto px-4 py-12 grid grid-cols-2 md:grid-cols-5 gap-8">
        <div className="col-span-2 space-y-3">
          <Link href="/" className="flex items-center gap-2">
            <BrandMark className="w-7 h-7 text-gold-500" />
            <span className="font-display font-semibold text-brand-700 text-lg tracking-tight">Afrione</span>
          </Link>
          <p className="text-sm text-muted-500 max-w-xs">
            The dual-stablecoin wallet for Africa. Hold AFRi and xGHS, send across borders, save in stable value.
          </p>
          <div className="flex gap-2 pt-2">
            <span className="badge-sage">
              <Icon name="shield" className="w-3 h-3" />
              Bank of Ghana licensed
            </span>
            <span className="badge-gold">
              <Icon name="shieldCheck" className="w-3 h-3" />
              100% reserves
            </span>
          </div>
        </div>

        <FooterCol title="Product" links={[
          { href: '/wallet', label: 'Wallet' },
          { href: '/transfer', label: 'Send money' },
          { href: '/convert', label: 'Convert' },
          { href: '/savings', label: 'Savings' },
          { href: '/collections', label: 'Collections' },
        ]} />

        <FooterCol title="Stablecoins" links={[
          { href: '#afri', label: 'AFRi · gold-backed' },
          { href: '#xghs', label: 'xGHS · cedi-pegged' },
          { href: '#reserves', label: 'Reserve audit' },
        ]} />

        <FooterCol title="Company" links={[
          { href: '#how', label: 'How it works' },
          { href: '#features', label: 'Features' },
          { href: '/api-demo', label: 'API demo' },
          { href: '/login', label: 'Sign in' },
        ]} />
      </div>

      <div className="border-t border-muted-100">
        <div className="max-w-6xl mx-auto px-4 py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-400">
          <p>© {new Date().getFullYear()} Afrione · Prototype · in-browser mock backend</p>
          <p className="font-mono">v0.1 — no real funds move</p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: Array<{ href: string; label: string }> }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-500 mb-3">{title}</p>
      <ul className="space-y-2">
        {links.map((l) => (
          <li key={l.href + l.label}>
            <Link href={l.href} className="text-sm text-muted-600 hover:text-brand-700 transition-colors">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
