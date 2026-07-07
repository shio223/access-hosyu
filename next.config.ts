import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // 短いURLエイリアス（ブックマーク・共有用）
      { source: "/menu", destination: "/", permanent: true },
      { source: "/inquiry", destination: "/equipment/maintenance-inquiry", permanent: true },
      { source: "/設備別保守実績照会", destination: "/equipment/maintenance-inquiry", permanent: true },
    ];
  },
};

export default nextConfig;
