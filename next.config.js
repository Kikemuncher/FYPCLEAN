// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: [
      "placehold.co", 
      "i.imgur.com", 
      "randomuser.me", 
      "assets.mixkit.co",
      "firebasestorage.googleapis.com" // Add Firebase Storage domain
    ],
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
  // CORS headers for video access
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version' },
        ],
      },
    ];
  },
  // Remove appDir from experimental since it's now the default
  // Add standalone output to improve deployment
  output: 'standalone',
  // Disable static pre-rendering for pages that use authentication
  staticPageGenerationTimeout: 300
};

module.exports = nextConfig;
