import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: "https://plausible.indexlabs.dev",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
