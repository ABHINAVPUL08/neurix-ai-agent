export const ACCEPTED_DOCUMENT_TYPES = {
  "application/pdf": [".pdf"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
    ".docx",
  ],
  "text/plain": [".txt"],
} as const;

export const ACCEPTED_EXTENSIONS = [".pdf", ".docx", ".txt"] as const;

import { VERCEL_MAX_UPLOAD_BYTES } from "@/lib/env";

/** Vercel serverless body limit (~4.5 MB); use 4 MB for safe margin */
export const MAX_DOCUMENT_SIZE_BYTES = VERCEL_MAX_UPLOAD_BYTES;

export const MAX_DOCUMENT_TEXT_LENGTH = 14_000;

export type DocumentFileType = "pdf" | "docx" | "txt";

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
  return null;
}
