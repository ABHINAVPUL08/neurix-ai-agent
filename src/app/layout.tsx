import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Neurix Solution",
  description:
    "Premium AI business consultant — automation, SaaS, voice agents & more",
  icons: {
    icon: "/neurix-logo.jpg",
    apple: "/neurix-logo.jpg",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover" as const,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${geistMono.variable} h-full overflow-x-hidden`}
    >
      <body className="min-h-full max-w-[100vw] overflow-x-hidden antialiased gradient-mesh">
        {children}
      </body>
    </html>
  );
}
