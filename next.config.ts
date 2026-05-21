import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  serverExternalPackages: [
    "pdf-parse",
    "@napi-rs/canvas",
    "mammoth",
    "@react-pdf/renderer",
  ],
};

export default nextConfig;
