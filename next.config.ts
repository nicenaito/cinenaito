import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.eiga.com',
      },
      {
        protocol: 'https',
        hostname: 'eiga.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
    ],
  },
  // クライアントナビゲーション時のキャッシュ保持期間
  experimental: {
    staleTimes: {
      dynamic: 30,   // 動的ページを30秒キャッシュ
      static: 180,   // 静的ページを3分キャッシュ
    },
  },
};

export default nextConfig;
