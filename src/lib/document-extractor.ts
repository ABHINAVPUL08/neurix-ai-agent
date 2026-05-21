import mammoth from "mammoth";
import { extractPdfTextFromBuffer } from "@/lib/pdfjs-server";
import {
  detectDocumentType,
  MAX_DOCUMENT_TEXT_LENGTH,
  type DocumentFileType,
} from "@/lib/document-types";

export type ExtractedDocument = {
  text: string;
  truncated: boolean;
  fileType: DocumentFileType;
  charCount: number;
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

/** Server-side text extraction from PDF, DOCX, or TXT (in-memory buffers only) */
export async function extractTextFromDocument(
  buffer: Buffer,
  mimeType: string,
  filename: string,
): Promise<ExtractedDocument> {
  const fileType = detectDocumentType(mimeType, filename);

  if (!fileType) {
    throw new Error("Unsupported file type. Upload PDF, DOCX, or TXT.");
  }

  let raw = "";

  switch (fileType) {
    case "pdf":
      raw = await extractPdfTextFromBuffer(buffer);
      break;
    case "docx":
      raw = await extractDocxText(buffer);
      break;
    case "txt":
      raw = extractTxtText(buffer);
      break;
  }

  const normalized = normalizeExtractedText(raw);

  if (!normalized) {
    throw new Error(
      "Could not extract readable text from this document. Try a text-based PDF or DOCX.",
    );
  }

  const { text, truncated } = truncateForAnalysis(normalized);

  return {
    text,
    truncated,
    fileType,
    charCount: normalized.length,
  };
}
