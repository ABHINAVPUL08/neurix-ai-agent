import { buildAuditReportExportData } from "@/lib/pdf-report/build-export-data";
import { EXPORT_PDF_FILENAME } from "@/lib/pdf-report/constants";
import type { AuditReportExportData } from "@/lib/pdf-report/types";

export type ExportAuditParams = {
  analysisContent: string;
  projectName?: string;
  sourceFilename?: string;
};

/** Yield so React can paint loading UI before heavy work */
export function yieldToMain(): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, 0);
  });
}

function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = "noopener";
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  window.setTimeout(() => URL.revokeObjectURL(url), 2000);
}

/** Payload sent to server — no large base64 logos */
function toServerPayload(data: AuditReportExportData): AuditReportExportData {
  const { logoDataUrl: _removed, logoPath: _path, ...rest } = data;
  return rest;
}

/**
 * Server-side PDF generation — keeps react-pdf off the main thread.
 */
export async function exportAuditReport(
  params: ExportAuditParams,
  onProgress?: (pct: number) => void,
): Promise<string> {
  onProgress?.(8);

  await yieldToMain();
  onProgress?.(15);

  const data = buildAuditReportExportData(params);
  const payload = toServerPayload(data);
  onProgress?.(28);

  await yieldToMain();

  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 120_000);

  try {
    const res = await fetch("/api/export-report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    onProgress?.(72);

    if (!res.ok) {
      const errBody = (await res.json().catch(() => ({}))) as {
        error?: string;
      };
      throw new Error(
        errBody.error ?? `Report export failed (${res.status})`,
      );
    }

    const contentType = res.headers.get("Content-Type") ?? "";
    if (!contentType.includes("application/pdf")) {
      throw new Error("Server did not return a PDF file.");
    }

    const blob = await res.blob();
    onProgress?.(92);

    if (!blob.size || blob.size < 500) {
      throw new Error("Generated PDF is empty or corrupted.");
    }

    await yieldToMain();

    triggerDownload(blob, EXPORT_PDF_FILENAME);
    onProgress?.(100);
    return EXPORT_PDF_FILENAME;
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new Error("Report generation timed out. Please try again.");
    }
    throw err instanceof Error
      ? err
      : new Error("Failed to generate report. Please try again.");
  } finally {
    window.clearTimeout(timeout);
  }
}
