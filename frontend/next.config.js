/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true // ignore ESLint errors on Vercel builds
  },
  typescript: {
    ignoreBuildErrors: true // ignore TS type errors on Vercel builds
  }
};

module.exports = nextConfig;
