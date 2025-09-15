/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: false // Enable ESLint checks
  },
  typescript: {
    ignoreBuildErrors: false // Enable TypeScript checks
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  },
  images: {
    domains: ['localhost', '127.0.0.1', 'quickbird.onrender.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'quickbird.onrender.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  experimental: {
    serverComponentsExternalPackages: ['@radix-ui/react-icons']
  }
};

module.exports = nextConfig;
