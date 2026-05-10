import Link from 'next/link';
import Image from 'next/image';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-brand-500 flex flex-col">
      {/* Nav */}
      <header className="px-6 py-4 flex items-center justify-between max-w-5xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <Image src="/logo-square.png" alt="AfriOne" width={32} height={32} />
          <span className="text-white font-bold text-xl tracking-tight">AfriOne</span>
        </div>
        <Link href="/login" className="text-sm text-white/80 hover:text-white transition-colors">
          Sign in →
        </Link>
      </header>

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 text-center py-16">
        <div className="mb-6 flex items-center gap-2">
          <span className="inline-flex items-center rounded-full bg-gold-400/20 border border-gold-400/40 px-3 py-1 text-sm text-gold-400 font-medium">
            Prototype v0.1
          </span>
        </div>

        <h1 className="text-5xl md:text-6xl font-bold text-white leading-tight max-w-2xl">
          Cross-border payments for Africa
        </h1>
        <p className="mt-6 text-brand-200 text-lg max-w-xl leading-relaxed">
          Send money, save in gold-backed stablecoins, and collect payments — all without a bank account.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/register"
            className="inline-flex items-center justify-center rounded-xl bg-gold-400 px-8 py-3 text-base font-semibold text-brand-900 hover:bg-gold-500 transition-colors shadow-lg"
          >
            Get started — it&apos;s free
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-xl bg-white/10 border border-white/20 px-8 py-3 text-base font-semibold text-white hover:bg-white/20 transition-colors"
          >
            Sign in
          </Link>
        </div>

        {/* Feature pills */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl w-full">
          {[
            { icon: '💸', title: 'Instant transfers', desc: 'Send AFRi or xGHS anywhere on the continent' },
            { icon: '🏅', title: 'Gold-backed savings', desc: 'AFRi is backed by physical gold reserves' },
            { icon: '🧾', title: 'Merchant collections', desc: 'Share a payment link, get paid in seconds' },
          ].map(({ icon, title, desc }) => (
            <div key={title} className="rounded-2xl bg-white/10 border border-white/10 p-5 text-left">
              <div className="text-3xl mb-3">{icon}</div>
              <p className="font-semibold text-white text-sm">{title}</p>
              <p className="text-brand-200 text-sm mt-1 leading-snug">{desc}</p>
            </div>
          ))}
        </div>

        {/* Demo note */}
        <p className="mt-12 text-brand-300 text-xs max-w-md">
          This is a prototype. All transactions are simulated — no real money moves.
          Use any phone number and the OTP shown in the server logs.
        </p>
      </div>
    </main>
  );
}
