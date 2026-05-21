"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import {
  FileText,
  Upload,
  X,
  Loader2,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import {
  ACCEPTED_DOCUMENT_TYPES,
  MAX_DOCUMENT_SIZE_BYTES,
} from "@/lib/document-types";
import {
  useDocumentAnalysis,
  type AnalysisMeta,
} from "@/hooks/useDocumentAnalysis";

type DocumentUploadProps = {
  disabled?: boolean;
  onBusyChange?: (busy: boolean) => void;
  onAnalysisComplete: (analysis: string, meta: AnalysisMeta) => void;
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function DocumentUpload({
  disabled = false,
  onBusyChange,
  onAnalysisComplete,
}: DocumentUploadProps) {
  const {
    file,
    phase,
    progress,
    error,
    isBusy,
    selectFile,
    reset,
    analyze,
  } = useDocumentAnalysis();

  const onDrop = useCallback(
    (accepted: File[]) => {
      if (accepted[0]) selectFile(accepted[0]);
    },
    [selectFile],
  );

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: ACCEPTED_DOCUMENT_TYPES,
    maxFiles: 1,
    maxSize: MAX_DOCUMENT_SIZE_BYTES,
    disabled: disabled || isBusy,
    noClick: true,
    noKeyboard: true,
  });

  const handleAnalyze = () => {
    analyze((result) => {
      onAnalysisComplete(result.analysis, result.meta);
    });
  };

  const showPreview = file && (phase === "preview" || phase === "error");
  const showProgress = phase === "uploading" || phase === "analyzing";

  useEffect(() => {
    onBusyChange?.(isBusy);
  }, [isBusy, onBusyChange]);

  return (
    <div className="mb-3 space-y-2">
      <div
        {...getRootProps()}
        className={`relative rounded-xl border border-dashed transition-all ${
          isDragActive
            ? "border-purple-400/70 bg-purple-500/10"
            : "border-purple-500/25 bg-black/20"
        } ${disabled || isBusy ? "pointer-events-none opacity-60" : ""}`}
      >
        <input {...getInputProps()} />

        <AnimatePresence>
          {isDragActive && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-purple-900/40 backdrop-blur-sm"
            >
              <p className="flex items-center gap-2 text-sm font-medium text-purple-200">
                <Upload className="h-4 w-4" />
                Drop your document here
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {!showPreview && !showProgress && (
          <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2.5">
            <p className="text-xs text-zinc-500 sm:text-sm">
              Upload PDF, DOCX, or TXT for AI project analysis
            </p>
            <motion.button
              type="button"
              onClick={open}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              disabled={disabled || isBusy}
              className="flex items-center gap-1.5 rounded-lg border border-purple-500/35 bg-purple-500/10 px-3 py-1.5 text-xs font-medium text-purple-200 transition-shadow hover:shadow-[0_0_14px_rgba(168,85,247,0.3)] sm:text-sm"
            >
              <Upload className="h-3.5 w-3.5" />
              Upload document
            </motion.button>
          </div>
        )}

        <AnimatePresence mode="wait">
          {showPreview && file && (
            <motion.div
              key="preview"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="flex items-center gap-3 px-3 py-3"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-500/20 ring-1 ring-purple-500/30">
                <FileText className="h-5 w-5 text-purple-300" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-zinc-100">
                  {file.name}
                </p>
                <p className="text-xs text-zinc-500">
                  {formatFileSize(file.size)} · Ready for analysis
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1.5">
                <motion.button
                  type="button"
                  onClick={handleAnalyze}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  disabled={disabled}
                  className="flex items-center gap-1 rounded-lg bg-gradient-to-r from-purple-600 to-violet-600 px-3 py-1.5 text-xs font-semibold text-white shadow-lg shadow-purple-900/40"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Analyze
                </motion.button>
                <button
                  type="button"
                  onClick={reset}
                  aria-label="Remove file"
                  className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-800/60 hover:text-zinc-300"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          )}

          {showProgress && (
            <motion.div
              key="progress"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-2 px-3 py-3"
            >
              <div className="flex items-center gap-2 text-sm text-purple-200">
                <Loader2 className="h-4 w-4 animate-spin" />
                {phase === "uploading"
                  ? "Uploading document…"
                  : "Neurix is analyzing your project…"}
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-zinc-800">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-purple-500 to-violet-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ ease: "easeOut" }}
                />
              </div>
              <p className="text-xs text-zinc-500">
                Extracting text · Identifying automations · Building recommendations
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {error && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-1.5 text-xs text-red-300"
        >
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          {error}
        </motion.p>
      )}
    </div>
  );
}
