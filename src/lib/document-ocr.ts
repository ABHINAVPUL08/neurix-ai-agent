import { createWorker, type Worker } from "tesseract.js";
import { renderPdfPagesToPngBuffers } from "@/lib/pdfjs-server";

/** Below this length, treat PDF as scanned and run OCR fallback */
export const MIN_TEXT_CHARS_FOR_PDF = 80;

export function getOcrMaxPages(): number {
  return process.env.VERCEL === "1" ? 5 : 10;
}

async function createOcrWorker(): Promise<Worker> {
  return createWorker("eng", 1, {
    logger: () => {},
  });
}

/** OCR a single image buffer (PNG/JPEG/WebP). */
export async function ocrImageBuffer(imageBuffer: Buffer): Promise<string> {
  const worker = await createOcrWorker();
  try {
    const { data } = await worker.recognize(imageBuffer);
    return data.text?.trim() ?? "";
  } finally {
    await worker.terminate();
  }
}

/** OCR multiple page images and join text. */
export async function ocrImageBuffers(images: Buffer[]): Promise<string> {
  if (images.length === 0) return "";

  const worker = await createOcrWorker();
  try {
    const parts: string[] = [];
    for (const img of images) {
      const { data } = await worker.recognize(img);
      const text = data.text?.trim();
      if (text) parts.push(text);
    }
    return parts.join("\n\n");
  } finally {
    await worker.terminate();
  }
}

/**
 * OCR fallback for scanned PDFs: render pages to PNG, then tesseract.
 */
export async function ocrPdfBuffer(
  buffer: Buffer,
  maxPages = getOcrMaxPages(),
): Promise<string> {
  const pageImages = await renderPdfPagesToPngBuffers(buffer, maxPages);
  if (pageImages.length === 0) {
    throw new Error("Could not render PDF pages for OCR.");
  }
  return ocrImageBuffers(pageImages);
}
