/** @type {import('next').NextConfig} */
const nextConfig = {
  // Use standard build for Cloudflare Pages with Next.js
  // Cloudflare Pages supports Next.js natively (no need for static export)
  
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
