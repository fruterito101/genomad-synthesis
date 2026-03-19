/** @type {import('next').NextConfig} */
const nextConfig = {
  // Next.js 16+ uses serverExternalPackages at root level
  serverExternalPackages: ["@noble/hashes", "@noble/curves"],
};

export default nextConfig;
