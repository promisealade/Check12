import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@check12/shared-types'],
  experimental: {
    typedRoutes: true,
  },
  // In production the API lives on a separate Railway domain.
  // NEXT_PUBLIC_API_URL is set in Vercel env vars.
  // In local dev it falls back to localhost:3001.
  async rewrites() {
    const apiBase = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
    return [
      {
        source: '/api/:path*',
        destination: `${apiBase}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
