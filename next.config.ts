import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@noble/hashes", "@noble/curves"],
};

export default nextConfig;
