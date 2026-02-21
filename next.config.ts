import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // クライアントナビゲーション時のキャッシュ保持期間
  experimental: {
    staleTimes: {
      dynamic: 30,   // 動的ページを30秒キャッシュ
      static: 180,   // 静的ページを3分キャッシュ
    },
  },
};

export default nextConfig;
