/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  images: {
    domains: ['supabase.com'],
    formats: ['image/webp', 'image/avif'],
  },
  swcMinify: true,
  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts'],
  },
};
 
module.exports = nextConfig;
 
