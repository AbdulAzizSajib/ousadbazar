import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/ousadbazar",
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ecommerce-pharma.s3.ap-southeast-1.amazonaws.com",
      },
    ],
  },
};

export default nextConfig;
