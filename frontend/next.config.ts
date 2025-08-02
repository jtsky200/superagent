import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  trailingSlash: true,
  swcMinify: true,
  poweredByHeader: false,
  compress: true,
  images: {
    domains: ['localhost', 'firebaseapp.com', 'web.app'],
    unoptimized: false,
    formats: ['image/webp', 'image/avif']
  },
  env: {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001',
  },
  eslint: {
    ignoreDuringBuilds: false,
    dirs: ['src']
  },
  typescript: {
    ignoreBuildErrors: false
  },
  experimental: {
    optimizePackageImports: ['lucide-react']
  }
};

export default nextConfig;
