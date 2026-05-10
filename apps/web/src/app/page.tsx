import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-brand-900 via-brand-700 to-gold-600 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Check12</h1>
          <p className="text-brand-100 text-lg">
            Dual-stablecoin platform for Africa
          </p>
          <div className="mt-4 flex justify-center gap-3">
            <span className="inline-flex items-center rounded-full bg-white/20 px-3 py-1 text-sm text-white">
              AFRi · Gold-backed
            </span>
            <span className="inline-flex items-center rounded-full bg-white/20 px-3 py-1 text-sm text-white">
              xGHS · GHS-pegged
            </span>
          </div>
        </div>

        <div className="card space-y-3">
          <Link href="/login" className="btn-primary w-full">
            Sign in
          </Link>
          <Link href="/register" className="btn-secondary w-full">
            Create account
          </Link>
        </div>

        <p className="mt-6 text-brand-200 text-sm">
          Cross-border payments · Digital savings · Business collections
        </p>
      </div>
    </main>
  );
}
