/**
 * Server-side pdf-parse setup for Vercel / Next.js serverless.
 * Must call ensurePdfWorker() before PDFParse — see pdf-parse troubleshooting.
 */
let workerInit: Promise<void> | null = null;

export async function ensurePdfWorker(): Promise<void> {
  if (!workerInit) {
    workerInit = (async () => {
      const { getData } = await import("pdf-parse/worker");
      const { PDFParse } = await import("pdf-parse");
      PDFParse.setWorker(getData());
    })().catch((err) => {
      workerInit = null;
      throw err;
    });
  }
  await workerInit;
}

export async function extractPdfTextFromBuffer(buffer: Buffer): Promise<string> {
  await ensurePdfWorker();
  const { PDFParse } = await import("pdf-parse");

  const parser = new PDFParse({ data: buffer });
  try {
    const result = await parser.getText();
    return result.text ?? "";
  } finally {
    await parser.destroy();
  }
}
