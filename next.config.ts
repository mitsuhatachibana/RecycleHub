import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
      },
    ],
  },
  experimental: {
    // serverActions expects an object with optional properties like
    // { bodySizeLimit?, allowedOrigins? }
    serverActions: {
      // allow local origin for server actions
      allowedOrigins: ['http://localhost:3000'],
    },
  },
};

export default nextConfig;
