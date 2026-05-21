import type { AnalysisMeta } from "@/hooks/useDocumentAnalysis";

export type DocumentAnalysisResult = {
  analysis: string;
  meta: AnalysisMeta;
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

  let data: { error?: string; analysis?: string; meta?: AnalysisMeta };
  try {
    data = await res.json();
  } catch {
    throw new Error(
      res.status === 413
        ? "File too large for upload. Maximum size is 4 MB."
        : "Document analysis failed. Please try again.",
    );
  }

  if (!res.ok) {
    throw new Error(
      data.error ??
        (res.status === 413
          ? "File too large for upload. Maximum size is 4 MB."
          : "Document analysis failed"),
    );
  }

  return {
    analysis: data.analysis as string,
    meta: data.meta as AnalysisMeta,
  };
}
