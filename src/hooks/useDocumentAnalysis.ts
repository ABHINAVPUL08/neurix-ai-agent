"use client";

import { useCallback, useRef, useState } from "react";
import { getClientMaxUploadBytes } from "@/lib/validate-document-file";

export type AnalysisPhase =
  | "idle"
  | "preview"
  | "uploading"
  | "analyzing"
  | "done"
  | "error";

export type AnalysisMeta = {
  filename: string;
  fileType: string;
  charCount: number;
  truncated: boolean;
  extractionMethod?: string;
};

type AnalysisResult = {
  analysis: string;
  meta: AnalysisMeta;
};

export function useDocumentAnalysis() {
  const [file, setFile] = useState<File | null>(null);
  const [phase, setPhase] = useState<AnalysisPhase>("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const progressTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearProgressTimer = useCallback(() => {
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current);
      progressTimerRef.current = null;
    }
  }, []);

  const selectFile = useCallback(
    (next: File | null) => {
      clearProgressTimer();
      setError(null);
      setProgress(0);
      setFile(next);
      setPhase(next ? "preview" : "idle");
    },
    [clearProgressTimer],
  );

  const reset = useCallback(() => {
    clearProgressTimer();
    setFile(null);
    setPhase("idle");
    setProgress(0);
    setError(null);
  }, [clearProgressTimer]);

  const startProgressSimulation = useCallback(() => {
    clearProgressTimer();
    setProgress(5);
    progressTimerRef.current = setInterval(() => {
      setProgress((p) => (p < 88 ? p + Math.random() * 6 : p));
    }, 280);
  }, [clearProgressTimer]);

  const analyze = useCallback(
    async (onSuccess: (result: AnalysisResult) => void) => {
      if (!file) return;

      if (file.size > getClientMaxUploadBytes()) {
        setError("File too large for upload.");
        setPhase("error");
        return;
      }

      setError(null);
      setPhase("uploading");
      startProgressSimulation();

      const formData = new FormData();
      formData.append("file", file);

      try {
        setPhase("analyzing");
        const res = await fetch("/api/analyze-document", {
          method: "POST",
          body: formData,
        });

        clearProgressTimer();
        setProgress(100);

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error ?? "Document analysis failed");
        }

        setPhase("done");
        onSuccess({
          analysis: data.analysis as string,
          meta: data.meta as AnalysisMeta,
        });
        reset();
      } catch (err) {
        clearProgressTimer();
        setProgress(0);
        setPhase("error");
        setError(
          err instanceof Error ? err.message : "Document analysis failed",
        );
      }
    },
    [file, reset, startProgressSimulation, clearProgressTimer],
  );

  const isBusy = phase === "uploading" || phase === "analyzing";

  return {
    file,
    phase,
    progress,
    error,
    isBusy,
    selectFile,
    reset,
    analyze,
  };
}
