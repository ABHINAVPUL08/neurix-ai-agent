import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  serverExternalPackages: [
    "pdfjs-dist",
    "@napi-rs/canvas",
    "mammoth",
    "@react-pdf/renderer",
  ],
};

export default nextConfig;
