/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: [],
  },
  // Preserve existing behavior
  experimental: {
    // No experimental features needed for this migration
  },
};

export default nextConfig;
