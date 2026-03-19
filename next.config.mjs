/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["@noble/hashes", "@noble/curves"],
  },
};

export default nextConfig;
