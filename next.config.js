// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      "placehold.co", 
      "i.imgur.com", 
      "randomuser.me", 
      "assets.mixkit.co",
      "firebasestorage.googleapis.com" // Add Firebase Storage domain
    ],
  },
  experimental: {
    // This disables the strict mode in development
    // which helps avoid double rendering and some hydration issues
    strictNextHead: true,
  },
  onDemandEntries: {
    // The period (in ms) where the server will keep pages in the buffer
    maxInactiveAge: 25 * 1000,
    // Number of pages that should be kept simultaneously without being disposed
    pagesBufferLength: 4,
  },
  webpack: (config, { isServer }) => {
    // Fix for the private class fields syntax issue
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        encoding: false,
      };
    }
    
    // Handle node-fetch polyfill
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        'encoding': false
      };
    }
    
    return config;
  },
  // Change back to 'standalone' since your app has dynamic pages
  output: 'standalone',
  // Disable static pre-rendering for pages that use authentication
  staticPageGenerationTimeout: 300,
  // Handle environment variables in builds
  env: {
    NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
  }
};

module.exports = nextConfig;
