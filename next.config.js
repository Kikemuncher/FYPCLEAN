/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Change standalone to export for static site generation
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
