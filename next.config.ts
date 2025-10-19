import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
    outputFileTracingRoot: __dirname, // or path.resolve(__dirname, 'finapp')
      eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
