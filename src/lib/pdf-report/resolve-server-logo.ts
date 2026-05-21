import fs from "fs";
import path from "path";

const LOGO_CANDIDATES = [
  "neurix-logo.png",
  "neurix-logo.jpg",
  "neurix-logo.jpeg",
  "neurix-logo.webp",
] as const;

const MIME: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
};

/**
 * Resolve Neurix logo for @react-pdf/renderer on Vercel/serverless.
 * Prefers base64 data URLs (reliable in serverless); falls back to filesystem path.
 */
export function resolveServerLogo(): {
  logoPath?: string;
  logoDataUrl?: string;
} {
  const publicDir = path.join(process.cwd(), "public");

  for (const name of LOGO_CANDIDATES) {
    const filePath = path.join(publicDir, name);
    try {
      if (!fs.existsSync(filePath)) continue;
      const ext = path.extname(name).slice(1).toLowerCase();
      const mime = MIME[ext];
      if (!mime) continue;

      const buffer = fs.readFileSync(filePath);
      if (buffer.length === 0) continue;

      return {
        logoDataUrl: `data:${mime};base64,${buffer.toString("base64")}`,
        logoPath: filePath,
      };
    } catch {
      continue;
    }
  }

  return {};
}
