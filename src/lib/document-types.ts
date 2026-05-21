import { MAX_UPLOAD_BYTES, VERCEL_MAX_UPLOAD_BYTES } from "@/lib/env";

export { MAX_UPLOAD_BYTES, VERCEL_MAX_UPLOAD_BYTES };

export const ACCEPTED_DOCUMENT_TYPES = {
  "application/pdf": [".pdf"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
    ".docx",
  ],
  "text/plain": [".txt"],
  "image/png": [".png"],
  "image/jpeg": [".jpg", ".jpeg"],
  "image/jpg": [".jpg"],
  "image/webp": [".webp"],
} as const;

export const ACCEPTED_EXTENSIONS = [
  ".pdf",
  ".docx",
  ".txt",
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
] as const;

export const MAX_DOCUMENT_TEXT_LENGTH = 14_000;

export type DocumentFileType = "pdf" | "docx" | "txt" | "image";

export type ExtractionMethod = "pdfjs" | "ocr" | "docx" | "txt";

export function detectDocumentType(
  mimeType: string,
  filename: string,
): DocumentFileType | null {
  const lower = filename.toLowerCase();
  if (mimeType === "application/pdf" || lower.endsWith(".pdf")) return "pdf";
  if (
    mimeType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    lower.endsWith(".docx")
  )
    return "docx";
  if (mimeType === "text/plain" || lower.endsWith(".txt")) return "txt";
  if (
    mimeType === "image/png" ||
    mimeType === "image/jpeg" ||
    mimeType === "image/jpg" ||
    mimeType === "image/webp" ||
    lower.endsWith(".png") ||
    lower.endsWith(".jpg") ||
    lower.endsWith(".jpeg") ||
    lower.endsWith(".webp")
  ) {
    return "image";
  }
  return null;
}
