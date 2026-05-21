import {
  detectDocumentType,
  MAX_DOCUMENT_SIZE_BYTES,
} from "@/lib/document-types";

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function validateDocumentFile(file: File): string | null {
  if (file.size > MAX_DOCUMENT_SIZE_BYTES) {
    return "File too large. Maximum size is 4 MB.";
  }
  if (!detectDocumentType(file.type, file.name)) {
    return "Unsupported file. Upload PDF, DOCX, or TXT.";
  }
  return null;
}

export const DOCUMENT_ACCEPT =
  ".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain";
