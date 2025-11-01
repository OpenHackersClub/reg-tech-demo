import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async headers() {
    return [
      {
        source: '/tooljet',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "frame-src 'self' https://app.tooljet.ai",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
