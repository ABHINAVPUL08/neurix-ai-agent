"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, FileUp } from "lucide-react";
import { DocumentUpload } from "@/components/DocumentUpload";
import type { AnalysisMeta } from "@/hooks/useDocumentAnalysis";

type UploadModalProps = {
  open: boolean;
  onClose: () => void;
  disabled?: boolean;
  onBusyChange?: (busy: boolean) => void;
  onAnalysisComplete: (analysis: string, meta: AnalysisMeta) => void;
};

export function UploadModal({
  open,
  onClose,
  disabled,
  onBusyChange,
  onAnalysisComplete,
}: UploadModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] bg-black/70 backdrop-blur-md"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 24 }}
            className="glass-premium fixed left-1/2 top-1/2 z-[91] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl p-5"
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileUp className="h-5 w-5 text-purple-300" />
                <h2 className="text-sm font-semibold text-white">
                  Upload project document
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800/50"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="mb-4 text-xs text-zinc-500">
              PDF, DOCX, or TXT — Neurix will extract text and generate a full
              business & AI analysis.
            </p>
            <DocumentUpload
              disabled={disabled}
              onBusyChange={onBusyChange}
              onAnalysisComplete={(analysis, meta) => {
                onAnalysisComplete(analysis, meta);
                onClose();
              }}
            />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
