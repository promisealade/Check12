import Link from 'next/link';
import { Icon } from '../icons';

/**
 * Split-layout auth shell.
 *  - Desktop (lg+): forest-green brand panel on the left with a mini wallet preview,
 *    the form card on the right.
 *  - Mobile: single column, full-screen height, with ambient gold + sage blobs.
 */
export function AuthShell({
  children,
  title,
  subtitle,
}: {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="bg-parchment lg:grid lg:grid-cols-[1.05fr_1fr] lg:min-h-screen">
      {/* Desktop brand billboard */}
      <aside className="relative hidden lg:flex bg-brand-700 text-white overflow-hidden">
        <div className="pointer-events-none absolute -top-32 -right-24 w-[30rem] h-[30rem] bg-gold-400/20 rounded-full blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-24 w-[26rem] h-[26rem] bg-sage-500/15 rounded-full blur-3xl" />

        <div className="relative z-10 flex flex-col justify-between p-12 xl:p-16 w-full max-w-xl mx-auto">
          <Link href="/" className="flex items-center gap-2.5 self-start group">
            <BrandMark className="w-8 h-8 text-gold-300 group-hover:text-gold-400 transition-colors" />
            <span className="font-display text-xl font-semibold tracking-tight">Afrione</span>
          </Link>

          <div className="space-y-10">
            <div className="space-y-4">
              <span className="inline-flex items-center gap-2 text-xs font-medium text-gold-300 uppercase tracking-wider">
                <span className="w-6 h-px bg-gold-300" />
                Dual-stablecoin wallet
              </span>
              <h2 className="font-display text-3xl xl:text-4xl font-semibold leading-[1.1] tracking-tight">
                Send. Save. Get&nbsp;paid — in stable value.
              </h2>
              <p className="text-white/70 text-sm xl:text-base max-w-md">
                Hold gold-backed AFRi or 1:1 cedi-pegged xGHS. Move money across borders in seconds.
              </p>
            </div>

            <MiniWalletPreview />

            <ul className="space-y-2.5 text-sm text-white/80">
              {[
                { icon: 'shield' as const,      label: 'Bank of Ghana licensed' },
                { icon: 'shieldCheck' as const, label: '100% reserves, audited daily' },
                { icon: 'checkCircle' as const, label: 'Settles in under 30 seconds' },
              ].map((row) => (
                <li key={row.label} className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-brand-800/60 ring-1 ring-gold-400/30 flex items-center justify-center text-gold-300">
                    <Icon name={row.icon} className="w-4 h-4" />
                  </span>
                  {row.label}
                </li>
              ))}
            </ul>
          </div>

          <p className="text-xs text-white/40">
            Prototype · no real funds move · v0.1
          </p>
        </div>
      </aside>

      {/* Form column */}
      <div className="relative flex flex-col px-4 py-10 lg:px-8 xl:px-12 overflow-hidden min-h-screen lg:min-h-0">
        {/* Mobile-only ambient blobs */}
        <div className="pointer-events-none absolute -top-40 -right-32 w-96 h-96 bg-gold-200/40 rounded-full blur-3xl lg:hidden" />
        <div className="pointer-events-none absolute -bottom-40 -left-32 w-96 h-96 bg-sage-200/40 rounded-full blur-3xl lg:hidden" />

        <Link href="/" className="relative flex items-center gap-2 self-center sm:self-start lg:hidden">
          <BrandMark className="w-8 h-8 text-gold-500" />
          <span className="font-display font-semibold text-brand-700 text-xl tracking-tight">Afrione</span>
        </Link>

        <div className="relative flex-1 flex items-center justify-center">
          <div className="w-full max-w-sm">
            <div className="text-center mb-6">
              <h1 className="font-display text-2xl lg:text-3xl font-semibold text-brand-700 tracking-tight">
                {title}
              </h1>
              <p className="mt-1.5 text-muted-500 text-sm">{subtitle}</p>
            </div>
            <div className="card shadow-card">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────── Mini wallet preview (desktop billboard) ─────────────── */

function MiniWalletPreview() {
  return (
    <div className="space-y-2.5">
      {/* AFRi card */}
      <div className="rounded-2xl bg-brand-800/70 ring-1 ring-gold-400/20 p-4 backdrop-blur-sm">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-full bg-gold-400 text-brand-900 flex items-center justify-center font-semibold text-sm">A</span>
            <div>
              <p className="text-sm font-medium">AFRi wallet</p>
              <p className="text-[11px] text-white/55">Gold-backed · USD-pegged</p>
            </div>
          </div>
          <span className="text-[10px] text-gold-300 bg-brand-900/40 ring-1 ring-gold-400/20 px-2 py-1 rounded-full font-medium whitespace-nowrap">
            Live · 14.82 GHS
          </span>
        </div>
        <p className="font-display text-2xl font-semibold tabular-nums leading-none">
          42.18 <span className="text-base text-white/60 font-medium">AFRi</span>
        </p>
        <p className="text-[11px] text-white/55 mt-1 tabular-nums">≈ GHS 625.31 · USD 42.18</p>
      </div>

      {/* xGHS row */}
      <div className="rounded-2xl bg-white/[0.06] ring-1 ring-white/10 p-3 flex items-center gap-2.5">
        <span className="w-8 h-8 rounded-full bg-sage-200 text-brand-700 flex items-center justify-center font-semibold text-sm">x</span>
        <div className="flex-1">
          <p className="text-sm font-medium">xGHS wallet</p>
          <p className="text-[11px] text-white/55">1:1 cedi · Bank-backed</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold tabular-nums">1,240.00</p>
          <p className="text-[11px] text-white/55 tabular-nums">GHS 1,240</p>
        </div>
      </div>
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
