/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ["placehold.co"], // Add TikTok's image domains when needed
  },
};

module.exports = nextConfig;
