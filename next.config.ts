import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  /** Ensures EmailJS NEXT_PUBLIC_* are inlined for client bundles on Vercel build */
  env: {
    NEXT_PUBLIC_EMAILJS_SERVICE_ID:
      process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID,
    NEXT_PUBLIC_EMAILJS_TEMPLATE_ID:
      process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID,
    NEXT_PUBLIC_EMAILJS_PUBLIC_KEY: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY,
  },
  serverExternalPackages: [
    "openai",
    "pdfjs-dist",
    "@napi-rs/canvas",
    "tesseract.js",
    "mammoth",
    "@react-pdf/renderer",
  ],
};

export default nextConfig;
