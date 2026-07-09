import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  experimental: {
    prerenderEarlyExit: false,
    staticGenerationRetryCount: 3,
  },
};

export default nextConfig;
