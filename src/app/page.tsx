/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // For static export - helps avoid client manifest issues
  output: 'export',
  images: {
    domains: [
      "placehold.co", 
      "i.imgur.com", 
      "randomuser.me", 
      "assets.mixkit.co"
    ],
    unoptimized: true, // Required for export
  },
  // Typescript-safe webpack config
  webpack: (config, { isServer }) => {
    // Fix for the private class fields syntax issue
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;
