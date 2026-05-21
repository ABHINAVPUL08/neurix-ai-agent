import type { AnalysisMeta } from "@/hooks/useDocumentAnalysis";

export type DocumentAnalysisResult = {
  analysis: string;
  meta: AnalysisMeta;
};

type ApiErrorBody = {
  error?: string;
  code?: string;
};

export async function analyzeDocumentFile(
  file: File,
  signal?: AbortSignal,
): Promise<DocumentAnalysisResult> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("/api/analyze-document", {
    method: "POST",
    body: formData,
    signal,
  });

  let data: ApiErrorBody & {
    analysis?: string;
    meta?: AnalysisMeta;
  };

  const rawText = await res.text();
  try {
    data = rawText ? (JSON.parse(rawText) as typeof data) : {};
  } catch {
    throw new Error(
      res.status === 413
        ? "File too large for this server. Try a file under 4 MB on the deployed app."
        : `Document analysis failed (${res.status}). Please try again.`,
    );
  }

  if (!res.ok) {
    const fallback =
      res.status === 413
        ? "File too large for upload."
        : res.status === 503
          ? "AI service is not configured. Contact the site administrator."
          : "Document analysis failed. Please try again.";

    throw new Error(data.error ?? fallback);
  }

  if (!data.analysis) {
    throw new Error(data.error ?? "No analysis returned from server.");
  }

  return {
    analysis: data.analysis,
    meta: data.meta as AnalysisMeta,
  };
}
