import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '4000',
        pathname: '/output/**',
      },
      {
        protocol: 'https',
        hostname: 'beat.optiwellai.com',
        pathname: '/output/**',
      },
      {
        protocol: 'https',
        hostname: 'optiwellai.com',
        pathname: '/output/**',
      },
      {
        protocol: 'https',
        hostname: 'optiwellai.com',
        pathname: '/api/output/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn1.suno.ai',
        pathname: '/**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
}

export default nextConfig;
