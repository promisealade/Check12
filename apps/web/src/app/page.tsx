import Link from 'next/link';
import { Icon, type IconName } from '../lib/icons';
import { BrandMark, Footer } from '../lib/components/Footer';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-parchment">
      <Navbar />
      <Hero />
      <TrustStrip />
      <CurrencyExplainer />
      <HowItWorks />
      <FeaturesGrid />
      <UseCases />
      <FinalCta />
      <Footer />
    </main>
  );
}

/* ─────────────── Navbar ─────────────── */

function Navbar() {
  return (
    <header className="bg-parchment/85 backdrop-blur sticky top-0 z-20 border-b border-muted-100/70">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <BrandMark className="w-8 h-8 text-gold-500" />
          <span className="font-display font-semibold text-brand-700 text-xl tracking-tight">Afrione</span>
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-sm text-muted-600">
          <a href="#how" className="hover:text-brand-700 transition-colors">How it works</a>
          <a href="#features" className="hover:text-brand-700 transition-colors">Features</a>
          <a href="#stablecoins" className="hover:text-brand-700 transition-colors">Stablecoins</a>
          <a href="#use-cases" className="hover:text-brand-700 transition-colors">Use cases</a>
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/login" className="btn-ghost">Sign in</Link>
          <Link href="/register" className="btn-primary !py-2 !px-4 text-sm">Get started</Link>
        </div>
      </div>
    </header>
  );
}

/* ─────────────── Hero ─────────────── */

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute -top-40 -right-32 w-[28rem] h-[28rem] bg-gold-200/40 rounded-full blur-3xl" />
      <div className="pointer-events-none absolute top-32 -left-32 w-96 h-96 bg-sage-200/50 rounded-full blur-3xl" />

      <div className="relative max-w-6xl mx-auto px-4 pt-12 pb-20 md:pt-20 md:pb-28 grid lg:grid-cols-12 gap-10 items-center">
        <div className="lg:col-span-7 space-y-7">
          <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gold-700">
            <span className="w-6 h-px bg-gold-500" />
            Built for Africa · 2026
          </span>
          <div className="flex gap-2 flex-wrap">
            <span className="badge-gold">AFRi · Gold-backed</span>
            <span className="badge-sage">xGHS · 1:1 Cedi</span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-[58px] font-semibold tracking-tight text-brand-700 leading-[1.05]">
            The dual-stablecoin wallet built for Africa.
          </h1>
          <p className="text-lg text-muted-600 max-w-xl">
            Hold gold-backed AFRi or 1:1 cedi-pegged xGHS. Send across borders in seconds, save in stable value, and accept payments — all from one wallet.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/register" className="btn-primary text-base px-5">
              Open your wallet
              <Icon name="arrowUpRight" className="w-4 h-4" />
            </Link>
            <Link href="/login" className="btn-secondary text-base px-5">
              Sign in
            </Link>
          </div>
          <div className="flex items-center gap-5 pt-2 text-sm text-muted-500">
            <span className="inline-flex items-center gap-1.5">
              <Icon name="shield" className="w-4 h-4 text-brand-500" />
              Bank of Ghana licensed
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Icon name="shieldCheck" className="w-4 h-4 text-gold-500" />
              100% reserves
            </span>
            <span className="hidden sm:inline-flex items-center gap-1.5">
              <Icon name="checkCircle" className="w-4 h-4 text-brand-500" />
              30-second settlement
            </span>
          </div>
        </div>

        <div className="lg:col-span-5">
          <WalletPreview />
        </div>
      </div>
    </section>
  );
}

function WalletPreview() {
  return (
    <div className="relative max-w-sm mx-auto">
      {/* Decorative back card */}
      <div className="absolute -inset-2 -z-10 bg-gradient-to-br from-sage-200/50 to-gold-200/50 rounded-[40px] blur-xl" />

      <div className="rounded-[36px] bg-white shadow-[0_30px_60px_rgba(31,47,34,0.10)] ring-1 ring-muted-100 p-5">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <BrandMark className="w-7 h-7 text-gold-500" />
            <div>
              <p className="text-muted-500 text-xs leading-tight">Akwaaba</p>
              <p className="font-medium text-brand-700 leading-tight text-sm">Kwame O.</p>
            </div>
          </div>
          <div className="flex gap-1.5">
            <span className="w-8 h-8 rounded-full bg-parchment text-muted-500 flex items-center justify-center">
              <Icon name="bell" className="w-4 h-4" />
            </span>
            <span className="w-8 h-8 rounded-full bg-parchment text-muted-500 flex items-center justify-center">
              <Icon name="qr" className="w-4 h-4" />
            </span>
          </div>
        </div>

        <div className="wallet-card p-5">
          <div className="flex justify-between items-start mb-6 gap-2">
            <div className="flex gap-2.5">
              <div className="token-bubble token-bubble--gold w-9 h-9 text-sm">A</div>
              <div>
                <div className="font-medium text-sm">AFRi wallet</div>
                <div className="text-white/65 text-xs">Gold-backed · USD-pegged</div>
              </div>
            </div>
            <span className="wallet-rate text-[10px] !px-2 !py-1 shrink-0">
              Live · 14.82 GHS
            </span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-display text-3xl font-semibold tabular-nums">42.18</span>
            <span className="text-white/70">AFRi</span>
          </div>
          <p className="text-white/65 text-xs mt-1">≈ GHS 625.31 · USD 42.18</p>
        </div>

        <div className="bg-parchment/60 ring-1 ring-muted-100 rounded-[20px] p-3.5 flex justify-between items-center mt-3">
          <div className="flex items-center gap-2.5">
            <div className="token-bubble token-bubble--sage w-8 h-8 text-sm">x</div>
            <div>
              <div className="text-sm font-medium text-brand-700">xGHS wallet</div>
              <div className="text-xs text-muted-500">1:1 cedi · Bank-backed</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium text-brand-700 tabular-nums">1,240.00</div>
            <div className="text-xs text-muted-500">GHS 1,240</div>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2 mt-4">
          {([
            { label: 'Send',    icon: 'arrowUpRight'   as IconName, tone: 'gold' as const },
            { label: 'Receive', icon: 'arrowDownLeft'  as IconName, tone: 'sage' as const },
            { label: 'Buy',     icon: 'plusCircle'     as IconName, tone: 'brand' as const },
            { label: 'Cash out',icon: 'swap'           as IconName, tone: 'sand' as const },
          ]).map(({ label, icon, tone }) => {
            const palette = {
              gold:  'bg-sand-100 text-gold-700',
              sage:  'bg-sage-100 text-brand-700',
              brand: 'bg-brand-50 text-brand-700',
              sand:  'bg-sand-50 text-gold-600',
            }[tone];
            return (
              <div key={label} className="flex flex-col items-center gap-1.5 p-2 rounded-2xl bg-parchment/40 ring-1 ring-muted-100">
                <span className={`w-8 h-8 rounded-full flex items-center justify-center ${palette}`}>
                  <Icon name={icon} className="w-4 h-4" />
                </span>
                <span className="text-[11px] font-medium text-brand-700">{label}</span>
              </div>
            );
          })}
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between mb-2 px-1">
            <p className="text-sm font-medium text-brand-700">Recent</p>
            <span className="text-xs text-muted-400">See all</span>
          </div>
          <div className="space-y-1.5">
            {[
              { title: 'Sent to Adaeze (NG)', sub: 'Today · Settled in 38s', amt: '−5.00 AFRi', sub2: '≈ NGN 8,420', isOut: true },
              { title: 'MTN MoMo top-up',    sub: 'Yesterday · 0% fee',     amt: '+500 xGHS',  sub2: 'GHS 500.00', isOut: false },
            ].map((r) => (
              <div key={r.title} className="flex items-center gap-2.5 px-2 py-2">
                <div className={`w-9 h-9 rounded-2xl flex items-center justify-center ${
                  r.isOut ? 'bg-sand-100 text-gold-700' : 'bg-sage-200 text-brand-700'
                }`}>
                  <Icon name={r.isOut ? 'arrowUpRight' : 'arrowDownLeft'} className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-brand-700 truncate">{r.title}</p>
                  <p className="text-[11px] text-muted-500">{r.sub}</p>
                </div>
                <div className="text-right">
                  <p className={`text-[13px] font-semibold tabular-nums ${r.isOut ? 'text-brand-700' : 'text-success-700'}`}>{r.amt}</p>
                  <p className="text-[11px] text-muted-500 tabular-nums">{r.sub2}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-center gap-2 mt-4 pt-3 border-t border-muted-100">
          <span className="badge-sage">
            <Icon name="shield" className="w-3 h-3" />
            BoG licensed
          </span>
          <span className="badge-gold">
            <Icon name="shieldCheck" className="w-3 h-3" />
            100% reserves
          </span>
        </div>
      </div>
    </div>
  );
}

/* ─────────────── Trust strip ─────────────── */

function TrustStrip() {
  const stats: Array<{ value: string; label: string }> = [
    { value: '30s',  label: 'settlement' },
    { value: '0.5%', label: 'transfer fee' },
    { value: '2',    label: 'stablecoins' },
    { value: '100%', label: 'reserves' },
    { value: '24/7', label: 'availability' },
  ];
  return (
    <section className="border-y border-muted-100 bg-white/40">
      <div className="max-w-6xl mx-auto px-4 py-6 flex items-center justify-center gap-x-8 gap-y-3 flex-wrap text-sm text-muted-500">
        {stats.map((s, i) => (
          <span key={s.label} className="inline-flex items-center gap-x-8">
            <span className="inline-flex items-baseline gap-2">
              <span className="font-display text-2xl font-semibold text-brand-700 tabular-nums">{s.value}</span>
              <span className="text-muted-500">{s.label}</span>
            </span>
            {i < stats.length - 1 && (
              <span aria-hidden="true" className="hidden md:inline-block w-1.5 h-1.5 rounded-full bg-sage-300" />
            )}
          </span>
        ))}
      </div>
    </section>
  );
}

/* ─────────────── Currency explainer ─────────────── */

function CurrencyExplainer() {
  return (
    <section id="stablecoins" className="max-w-6xl mx-auto px-4 py-20">
      <SectionHeader
        kicker="Two stablecoins, one wallet"
        title="Stability that fits how you actually use money."
        sub="Hold value in gold for the long term. Spend in cedi for the everyday."
      />

      <div className="grid md:grid-cols-2 gap-6 mt-12">
        {/* AFRi */}
        <div id="afri" className="wallet-card p-8">
          <div className="absolute -top-12 -right-12 w-64 h-64 bg-gold-400/15 rounded-full blur-3xl" />
          <div className="relative space-y-5">
            <div className="flex items-center gap-3">
              <div className="token-bubble token-bubble--gold w-12 h-12 text-lg">A</div>
              <div>
                <h3 className="font-display text-xl font-semibold">AFRi</h3>
                <p className="text-white/65 text-sm">USD-pegged · Gold-backed</p>
              </div>
            </div>
            <p className="text-white/80">
              Built for saving and store-of-value. Each AFRi is backed 1:1 by physical gold reserves, audited daily — a credible hedge against African currency drift that USDC and USDT don&apos;t offer.
            </p>
            <ul className="space-y-2.5 text-sm text-white/80">
              <Bullet>1 AFRi = 1 USD</Bullet>
              <Bullet>Backed 1:1 by physical gold (Fireblocks custody)</Bullet>
              <Bullet>Daily reserve reconciliation, public audit trail</Bullet>
              <Bullet>Earn savings goals in stable value</Bullet>
            </ul>
          </div>
        </div>

        {/* xGHS */}
        <div id="xghs" className="rounded-[32px] bg-white ring-1 ring-muted-100 p-8 space-y-5 relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-64 h-64 bg-sage-200/40 rounded-full blur-3xl" />
          <div className="relative space-y-5">
            <div className="flex items-center gap-3">
              <div className="token-bubble token-bubble--sage w-12 h-12 text-lg">x</div>
              <div>
                <h3 className="font-display text-xl font-semibold text-brand-700">xGHS</h3>
                <p className="text-muted-500 text-sm">1:1 Ghana Cedi · Bank-backed</p>
              </div>
            </div>
            <p className="text-muted-600">
              Built for everyday spending. Pegged 1:1 to the Ghana Cedi and backed by ring-fenced bank reserves — so you never have to think in dollars when paying locally.
            </p>
            <ul className="space-y-2.5 text-sm text-muted-600">
              <Bullet light>1 xGHS = 1 GHS, always</Bullet>
              <Bullet light>Reserves held with regulated banking partners</Bullet>
              <Bullet light>On-ramp via MTN, Vodafone, AirtelTigo, bank transfer</Bullet>
              <Bullet light>Accept payments from anyone with a phone</Bullet>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

function Bullet({ children, light }: { children: React.ReactNode; light?: boolean }) {
  return (
    <li className="flex items-start gap-2">
      <Icon name="check" className={`w-4 h-4 mt-0.5 shrink-0 ${light ? 'text-brand-500' : 'text-gold-300'}`} />
      <span>{children}</span>
    </li>
  );
}

/* ─────────────── How it works ─────────────── */

function HowItWorks() {
  const steps: Array<{ icon: IconName; title: string; body: string; tone: 'gold' | 'sage' | 'brand' }> = [
    { icon: 'user', title: 'Create your wallet', body: 'Sign up with your phone number. Verify in under a minute — no paperwork.', tone: 'gold' },
    { icon: 'plusCircle', title: 'Top up in seconds', body: 'Fund from MTN, Vodafone, AirtelTigo, or bank transfer. Choose AFRi for saving or xGHS for spending.', tone: 'sage' },
    { icon: 'send', title: 'Send, save, get paid', body: 'Move money cross-border instantly, set savings goals, or share a payment link to collect.', tone: 'brand' },
  ];
  const tonePalette = {
    gold:  'bg-sand-100 text-gold-700',
    sage:  'bg-sage-100 text-brand-700',
    brand: 'bg-brand-50  text-brand-700',
  };
  return (
    <section id="how" className="bg-white border-y border-muted-100">
      <div className="max-w-6xl mx-auto px-4 py-20">
        <SectionHeader
          kicker="How it works"
          title="From sign-up to first transfer in under five minutes."
        />
        <div className="grid md:grid-cols-3 gap-6 mt-12 relative">
          {/* Connector line, desktop only */}
          <div aria-hidden="true" className="hidden md:block absolute left-[12%] right-[12%] top-12 h-px bg-gradient-to-r from-transparent via-gold-300/40 to-transparent" />
          {steps.map((s, i) => (
            <div key={s.title} className="relative">
              <div className="card h-full space-y-3">
                <div className="flex items-center gap-3">
                  <span className={`w-12 h-12 rounded-2xl flex items-center justify-center ${tonePalette[s.tone]}`}>
                    <Icon name={s.icon} className="w-5 h-5" />
                  </span>
                  <span className="text-sm font-mono font-semibold text-gold-500 tabular-nums">
                    0{i + 1}
                  </span>
                </div>
                <h3 className="font-display font-medium text-brand-700 text-lg">{s.title}</h3>
                <p className="text-sm text-muted-500">{s.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────── Features grid ─────────────── */

function FeaturesGrid() {
  const features: Array<{ icon: IconName; title: string; body: string; tone: 'brand' | 'gold' | 'sage' }> = [
    { icon: 'send', title: 'Cross-border transfers', body: 'Send AFRi or xGHS to anyone with a phone. Settles in seconds, fees under 1%.', tone: 'gold' },
    { icon: 'swap', title: 'Instant conversion', body: 'Swap between AFRi and xGHS at a live oracle rate. No spread games.', tone: 'sage' },
    { icon: 'bank', title: 'Stable savings goals', body: 'Save in AFRi, set targets, watch progress. Hedge against local currency drift.', tone: 'brand' },
    { icon: 'collect', title: 'Payment collections', body: 'Generate a payment link in 10 seconds. Customers pay via mobile money — you get the value.', tone: 'gold' },
    { icon: 'id', title: 'Tiered KYC', body: 'Start transacting at Tier 0. Unlock higher limits as you verify — no friction barriers.', tone: 'sage' },
    { icon: 'shieldCheck', title: 'Reserves audit', body: 'Every AFRi is backed by gold. Daily reconciliation report, public reserve dashboard.', tone: 'brand' },
  ];
  const tonePalette = {
    brand: 'bg-brand-50 text-brand-700',
    gold:  'bg-sand-100 text-gold-700',
    sage:  'bg-sage-100 text-brand-700',
  };
  return (
    <section id="features" className="max-w-6xl mx-auto px-4 py-20">
      <SectionHeader
        kicker="Features"
        title="Everything you need to move, save, and accept value."
      />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-12">
        {features.map((f) => (
          <div key={f.title} className="card hover:shadow-md transition-shadow">
            <span className={`w-10 h-10 rounded-2xl flex items-center justify-center mb-3 ${tonePalette[f.tone]}`}>
              <Icon name={f.icon} className="w-5 h-5" />
            </span>
            <h3 className="font-display font-medium text-brand-700">{f.title}</h3>
            <p className="text-sm text-muted-500 mt-1.5">{f.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─────────────── Use cases ─────────────── */

function UseCases() {
  const cases = [
    {
      tag: 'For individuals',
      title: 'Send home, save for tomorrow.',
      body: 'Whether you\'re sending money to family, saving for school fees, or hedging against the cedi, Afrione gives you stable value and instant access.',
      stats: [
        { value: '< 30s', label: 'cross-border settlement' },
        { value: '0.5%', label: 'transfer fee' },
      ],
      cta: { href: '/register', label: 'Open a personal account' },
    },
    {
      tag: 'For businesses',
      title: 'Accept payments. Reconcile easily.',
      body: 'Generate payment links for invoices, accept mobile money, and pay suppliers across borders. Track everything in one dashboard.',
      stats: [
        { value: '0%', label: 'fee on collections' },
        { value: '24h', label: 'business KYB approval' },
      ],
      cta: { href: '/register', label: 'Set up business account' },
    },
  ];
  return (
    <section id="use-cases" className="bg-white border-y border-muted-100">
      <div className="max-w-6xl mx-auto px-4 py-20 grid md:grid-cols-2 gap-6">
        {cases.map((c) => (
          <div key={c.tag} className="rounded-[32px] bg-parchment/60 ring-1 ring-muted-100 p-8 space-y-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-gold-700">{c.tag}</p>
            <h3 className="font-display text-2xl font-semibold tracking-tight text-brand-700">{c.title}</h3>
            <p className="text-muted-600">{c.body}</p>
            <div className="flex gap-8 pt-2">
              {c.stats.map((s) => (
                <div key={s.label}>
                  <p className="font-display text-2xl font-semibold text-brand-700 tabular-nums">{s.value}</p>
                  <p className="text-xs text-muted-500">{s.label}</p>
                </div>
              ))}
            </div>
            <Link href={c.cta.href} className="btn-secondary text-sm">
              {c.cta.label}
              <Icon name="arrowUpRight" className="w-4 h-4" />
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─────────────── Final CTA ─────────────── */

function FinalCta() {
  return (
    <section className="max-w-6xl mx-auto px-4 py-24">
      <div className="rounded-[40px] bg-brand-700 text-white p-10 md:p-16 relative overflow-hidden text-center shadow-wallet">
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-gold-400/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-gold-400/15 rounded-full blur-3xl" />
        <div className="relative space-y-6 max-w-2xl mx-auto">
          <BrandMark className="w-12 h-12 text-gold-300 mx-auto" />
          <h2 className="font-display text-3xl md:text-5xl font-semibold tracking-tight leading-tight">
            Your wallet is ready when you are.
          </h2>
          <p className="text-white/80 text-lg">
            Open an account in under a minute. Sign in to a demo account and explore — all with zero risk.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/register" className="btn-gold text-base px-6">
              Get started free
              <Icon name="arrowUpRight" className="w-4 h-4" />
            </Link>
            <Link href="/login" className="btn-secondary !bg-white/10 !text-white !ring-white/20 hover:!bg-white/15 text-base px-6">
              Try a demo account
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────── helpers ─────────────── */

function SectionHeader({ kicker, title, sub }: { kicker: string; title: string; sub?: string }) {
  return (
    <div className="text-center max-w-2xl mx-auto space-y-3">
      <p className="inline-flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-wider text-gold-700">
        <span className="w-5 h-px bg-gold-500" />
        {kicker}
        <span className="w-5 h-px bg-gold-500" />
      </p>
      <h2 className="font-display text-3xl md:text-4xl font-semibold tracking-tight text-brand-700">{title}</h2>
      {sub && <p className="text-muted-500">{sub}</p>}
    </div>
  );
}
