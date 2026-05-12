import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'fab-lab.nu',
        pathname: '/cdn/shop/**',
      },
    ],
  },
};

export default nextConfig;
