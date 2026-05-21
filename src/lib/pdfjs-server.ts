import { createCanvas } from "@napi-rs/canvas";
import path from "path";
import { pathToFileURL } from "url";

type PdfJsModule = typeof import("pdfjs-dist/legacy/build/pdf.mjs");

let pdfjsModule: PdfJsModule | null = null;
let workerReady: Promise<void> | null = null;

async function getPdfJs(): Promise<PdfJsModule> {
  if (!pdfjsModule) {
    pdfjsModule = await import("pdfjs-dist/legacy/build/pdf.mjs");
  }
  return pdfjsModule;
}

/** Configure pdf.js worker once (required for Node / Vercel serverless). */
export async function ensurePdfJsWorker(): Promise<void> {
  if (!workerReady) {
    workerReady = (async () => {
      const pdfjs = await getPdfJs();
      const workerPath = path.join(
        process.cwd(),
        "node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs",
      );
      pdfjs.GlobalWorkerOptions.workerSrc = pathToFileURL(workerPath).href;
    })().catch((err) => {
      workerReady = null;
      throw err;
    });
  }
  await workerReady;
}

function textFromTextContent(
  items: import("pdfjs-dist/types/src/display/api").TextContent["items"],
): string {
  const parts: string[] = [];
  for (const item of items) {
    if ("str" in item && typeof item.str === "string" && item.str.length > 0) {
      parts.push(item.str);
    }
  }
  return parts.join(" ");
}

/**
 * Extract plain text from a PDF buffer using pdfjs-dist (in-memory only).
 */
export async function extractPdfTextFromBuffer(buffer: Buffer): Promise<string> {
  await ensurePdfJsWorker();
  const pdfjs = await getPdfJs();

  const data = new Uint8Array(buffer);
  const loadingTask = pdfjs.getDocument({
    data,
    useSystemFonts: true,
    disableFontFace: true,
  });

  const doc = await loadingTask.promise;
  const pageTexts: string[] = [];

  try {
    for (let pageNum = 1; pageNum <= doc.numPages; pageNum++) {
      const page = await doc.getPage(pageNum);
      try {
        const textContent = await page.getTextContent();
        const pageText = textFromTextContent(textContent.items);
        if (pageText.trim()) {
          pageTexts.push(pageText);
        }
      } finally {
        page.cleanup();
      }
    }
  } finally {
    await doc.destroy();
  }

  return pageTexts.join("\n\n");
}

/**
 * Render PDF pages to PNG buffers for OCR (in-memory, no filesystem).
 */
export async function renderPdfPagesToPngBuffers(
  buffer: Buffer,
  maxPages = 10,
): Promise<Buffer[]> {
  await ensurePdfJsWorker();
  const pdfjs = await getPdfJs();

  const data = new Uint8Array(buffer);
  const doc = await pdfjs.getDocument({
    data,
    useSystemFonts: true,
    disableFontFace: true,
  }).promise;

  const images: Buffer[] = [];
  const pageCount = Math.min(doc.numPages, Math.max(1, maxPages));

  try {
    for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
      const page = await doc.getPage(pageNum);
      try {
        const viewport = page.getViewport({ scale: 2 });
        const width = Math.floor(viewport.width);
        const height = Math.floor(viewport.height);
        const canvas = createCanvas(width, height);
        const context = canvas.getContext("2d");

        await page.render({
          canvas: canvas as unknown as HTMLCanvasElement,
          canvasContext:
            context as unknown as CanvasRenderingContext2D,
          viewport,
        }).promise;

        images.push(canvas.toBuffer("image/png"));
      } finally {
        page.cleanup();
      }
    }
  } finally {
    await doc.destroy();
  }

  return images;
}
