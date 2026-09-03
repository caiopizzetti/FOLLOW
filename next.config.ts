import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // node:sqlite is a Node built-in (experimental in Node 22) and must never be
  // bundled — keep it external so the server runtime resolves it natively.
  serverExternalPackages: [],
  webpack: (config) => {
    config.externals = [...(config.externals ?? []), { "node:sqlite": "commonjs node:sqlite" }];
    return config;
  },
};

export default nextConfig;
