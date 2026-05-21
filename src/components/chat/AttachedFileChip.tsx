"use client";

import { motion } from "framer-motion";
import { FileText, X, Check } from "lucide-react";
import { formatFileSize } from "@/lib/validate-document-file";

type AttachedFileChipProps = {
  file: File;
  showSuccess?: boolean;
  onRemove: () => void;
};

export function AttachedFileChip({
  file,
  showSuccess,
  onRemove,
}: AttachedFileChipProps) {
  const isPdf = file.name.toLowerCase().endsWith(".pdf");

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 6, scale: 0.96 }}
      className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 sm:px-4 ${
        showSuccess
          ? "border-green-500/40 bg-green-500/10 shadow-[0_0_20px_rgba(34,197,94,0.15)]"
          : "border-purple-500/35 bg-purple-500/10 shadow-[0_0_16px_rgba(168,85,247,0.2)]"
      }`}
    >
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
          isPdf
            ? "bg-red-500/15 ring-1 ring-red-400/30"
            : "bg-purple-500/20 ring-1 ring-purple-400/30"
        }`}
      >
        {showSuccess ? (
          <Check className="h-5 w-5 text-green-400" />
        ) : (
          <FileText
            className={`h-5 w-5 ${isPdf ? "text-red-300" : "text-purple-300"}`}
          />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-zinc-100">{file.name}</p>
        <p className="text-xs text-zinc-500">
          {formatFileSize(file.size)}
          {showSuccess ? " · Ready to send" : " · Attached"}
        </p>
      </div>
      <motion.button
        type="button"
        onClick={onRemove}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-800/60 hover:text-white"
        aria-label="Remove attachment"
      >
        <X className="h-4 w-4" />
      </motion.button>
    </motion.div>
  );
}
