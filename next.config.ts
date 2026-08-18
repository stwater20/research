import type { NextConfig } from "next";

const isPagesBuild = process.env.GITHUB_PAGES === "true";
const basePath = isPagesBuild ? (process.env.BASE_PATH ?? "") : "";

const nextConfig: NextConfig = isPagesBuild ? {
  output: "export",
  trailingSlash: true,
  basePath,
  assetPrefix: basePath || undefined,
  images: { unoptimized: true },
  poweredByHeader: false,
  reactStrictMode: true,
} : {};

export default nextConfig;
