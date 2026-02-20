const path = require("path");

/** @type {import('next').NextConfig} */

const withPWA = require("next-pwa")({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
});

// آدرس بک‌اند — در صورت نبود env، به پورت 4000 فال‌بک می‌کنه
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

const nextConfig = {
  reactStrictMode: true,
  output: "standalone",

  // رفع مشکل workspace root
  outputFileTracingRoot: path.join(__dirname),

  // ✅ Proxy: تمام درخواست‌های /api/* و /uploads/* رو به بک‌اند ارسال می‌کنه
  // دیگه نیازی نیست فرانت مستقیم به پورت 4000 بزنه
  // localhost:3000/api/... → localhost:4000/api/...
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${BACKEND_URL}/api/:path*`,
      },
      {
        source: "/uploads/:path*",
        destination: `${BACKEND_URL}/uploads/:path*`,
      },
    ];
  },

  // تنظیمات تصاویر
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "localhost",
      },
    ],
  },

  // تنظیمات webpack
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        net: false,
        tls: false,
        fs: false,
        dns: false,
      };
    }
    return config;
  },

  typescript: {
    ignoreBuildErrors: false,
  },

  eslint: {
    ignoreDuringBuilds: false,
  },
};

module.exports = withPWA(nextConfig);
