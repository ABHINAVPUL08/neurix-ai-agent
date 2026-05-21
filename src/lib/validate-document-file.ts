import {
  detectDocumentType,
  MAX_UPLOAD_BYTES,
  VERCEL_MAX_UPLOAD_BYTES,
} from "@/lib/document-types";
import { getMaxUploadLabel } from "@/lib/env";

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Client-side upload limit (4 MB on deployed hosts, 9 MB on localhost) */
export function getClientMaxUploadBytes(): number {
  if (typeof window === "undefined") {
    return MAX_UPLOAD_BYTES;
  }
  const host = window.location.hostname;
  if (host === "localhost" || host === "127.0.0.1") {
    return MAX_UPLOAD_BYTES;
  }
  return VERCEL_MAX_UPLOAD_BYTES;
}

export function validateDocumentFile(file: File): string | null {
  const maxBytes = getClientMaxUploadBytes();
  if (file.size > maxBytes) {
    const label =
      maxBytes === VERCEL_MAX_UPLOAD_BYTES ? "4 MB" : getMaxUploadLabel();
    return `File too large. Maximum size is ${label}.`;
  }
  if (!detectDocumentType(file.type, file.name)) {
    return "Unsupported file. Upload PDF, DOCX, or TXT.";
  }
  return null;
}

export const DOCUMENT_ACCEPT =
  ".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain";
