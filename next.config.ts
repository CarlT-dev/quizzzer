import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    proxyClientMaxBodySize: "20mb",
    serverActions: {
      bodySizeLimit: "20mb",
    },
  },
  async redirects() {
    return [
      {
        source: "/self-practice",
        destination: "/practice",
        permanent: false,
      },
      {
        source: "/make-quiz",
        destination: "/create-quiz",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
