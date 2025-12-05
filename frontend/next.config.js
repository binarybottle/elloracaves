/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable Next.js image optimization (using Cloudflare Images instead)
  images: {
    unoptimized: true,
  },
  
  // Trailing slashes for cleaner URLs
  trailingSlash: true,
  
  // Enable React strict mode
  reactStrictMode: true,
};

module.exports = nextConfig;
