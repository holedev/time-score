import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {},
  typescript: {
    ignoreBuildErrors: true
  },
  output: "standalone",
  outputFileTracingExcludes: {
    "*": [".next/export-detail.json"],
    "/api/docs": ["./.next/cache/**/*"]
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**"
      }
    ]
  },
  webpack: (
    config,
    {
      buildId: _buildId,
      dev,
      isServer: _isServer,
      defaultLoaders: _defaultLoaders,
      nextRuntime: _nextRuntime,
      webpack: _webpack
    }
  ) => {
    if (config.cache && !dev) {
      config.cache = Object.freeze({ type: "memory" });
    }
    // Important: return the modified config
    return config;
  }
};

export default nextConfig;
