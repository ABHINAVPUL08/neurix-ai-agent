import mammoth from "mammoth";
import { logAnalyzeDocument } from "@/lib/analyze-document-log";
import {
  MIN_TEXT_CHARS_FOR_PDF,
  ocrImageBuffer,
  ocrPdfBuffer,
} from "@/lib/document-ocr";
import { extractPdfTextFromBuffer } from "@/lib/pdfjs-server";
import {
  detectDocumentType,
  MAX_DOCUMENT_TEXT_LENGTH,
  type DocumentFileType,
  type ExtractionMethod,
} from "@/lib/document-types";

export type ExtractedDocument = {
  text: string;
  truncated: boolean;
  fileType: DocumentFileType;
  charCount: number;
  extractionMethod: ExtractionMethod;
};

async function extractDocxText(buffer: Buffer): Promise<string> {
  const result = await mammoth.extractRawText({ buffer });
  return result.value ?? "";
}

function extractTxtText(buffer: Buffer): string {
  return buffer.toString("utf-8");
}

function normalizeExtractedText(text: string): string {
  return text.replace(/\r\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
}

function truncateForAnalysis(text: string): {
  text: string;
  truncated: boolean;
} {
  if (text.length <= MAX_DOCUMENT_TEXT_LENGTH) {
    return { text, truncated: false };
  }
  return {
    text: `${text.slice(0, MAX_DOCUMENT_TEXT_LENGTH)}\n\n[Document truncated for analysis — focus on the content above.]`,
    truncated: true,
  };
}

async function extractPdfWithFallback(buffer: Buffer): Promise<{
  raw: string;
  method: ExtractionMethod;
}> {
  const pdfText = await extractPdfTextFromBuffer(buffer);
  const pdfNormalized = normalizeExtractedText(pdfText);

  if (pdfNormalized.length >= MIN_TEXT_CHARS_FOR_PDF) {
    return { raw: pdfText, method: "pdfjs" };
  }

  try {
    logAnalyzeDocument("ocr_fallback_start", {
      pdfTextLength: pdfNormalized.length,
      threshold: MIN_TEXT_CHARS_FOR_PDF,
    });
    const ocrText = await ocrPdfBuffer(buffer);
    const ocrNormalized = normalizeExtractedText(ocrText);
    logAnalyzeDocument("ocr_fallback_done", {
      ocrTextLength: ocrNormalized.length,
    });

    if (ocrNormalized.length > pdfNormalized.length) {
      return { raw: ocrText, method: "ocr" };
    }

    if (pdfNormalized.length > 0) {
      return { raw: pdfText, method: "pdfjs" };
    }

    if (ocrNormalized.length > 0) {
      return { raw: ocrText, method: "ocr" };
    }
  } catch (ocrErr) {
    logAnalyzeDocument("ocr_fallback_failed", {
      message: ocrErr instanceof Error ? ocrErr.message : "unknown",
    });
    if (pdfNormalized.length > 0) {
      return { raw: pdfText, method: "pdfjs" };
    }
    throw new Error(
      "Could not read this scanned PDF. OCR failed — try a clearer scan or a text-based PDF.",
    );
  }

  throw new Error(
    "Could not extract readable text from this PDF. It may be a blank or heavily corrupted scan.",
  );
}

/** Server-side text extraction from PDF, DOCX, TXT, or images (in-memory buffers only) */
export async function extractTextFromDocument(
  buffer: Buffer,
  mimeType: string,
  filename: string,
): Promise<ExtractedDocument> {
  const fileType = detectDocumentType(mimeType, filename);

  if (!fileType) {
    throw new Error(
      "Unsupported file type. Upload PDF, DOCX, TXT, or an image (PNG/JPG/WebP).",
    );
  }

  let raw = "";
  let extractionMethod: ExtractionMethod = "pdfjs";

  switch (fileType) {
    case "pdf": {
      const result = await extractPdfWithFallback(buffer);
      raw = result.raw;
      extractionMethod = result.method;
      break;
    }
    case "docx":
      raw = await extractDocxText(buffer);
      extractionMethod = "docx";
      break;
    case "txt":
      raw = extractTxtText(buffer);
      extractionMethod = "txt";
      break;
    case "image": {
      try {
        raw = await ocrImageBuffer(buffer);
        extractionMethod = "ocr";
      } catch {
        throw new Error(
          "Could not read text from this image. Try a clearer PNG or JPG scan.",
        );
      }
      break;
    }
  }

  const normalized = normalizeExtractedText(raw);

  if (!normalized) {
    throw new Error(
      "Could not extract readable text from this document. For scans, use a clear image or PDF.",
    );
  }

  const { text, truncated } = truncateForAnalysis(normalized);

  return {
    text,
    truncated,
    fileType,
    charCount: normalized.length,
    extractionMethod,
  };
}
