import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    prerenderEarlyExit: false,
    staticGenerationRetryCount: 3,
  },
};

export default nextConfig;
