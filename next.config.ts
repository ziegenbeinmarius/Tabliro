import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    serverActions: {},
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "media0.giphy.com",
        port: "",
        pathname: "/media/**",
      },
    ],
  },
};

export default nextConfig;
