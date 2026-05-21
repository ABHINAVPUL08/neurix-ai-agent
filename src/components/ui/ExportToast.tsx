"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, AlertCircle, X } from "lucide-react";

export type ExportToastState = {
  type: "success" | "error";
  message: string;
  filename?: string;
} | null;

type ExportToastProps = {
  toast: ExportToastState;
  onDismiss: () => void;
};

export function ExportToast({ toast, onDismiss }: ExportToastProps) {
  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.96 }}
          className="export-toast fixed bottom-24 left-1/2 z-[80] flex w-[min(420px,calc(100%-2rem))] -translate-x-1/2 items-start gap-3 rounded-2xl border border-purple-500/35 bg-[#12081f]/95 px-4 py-3.5 shadow-[0_12px_40px_rgba(0,0,0,0.5),0_0_32px_rgba(168,85,247,0.2)] backdrop-blur-xl"
          role="status"
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
          ) : (
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />
          )}
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-zinc-100">{toast.message}</p>
            {toast.filename && (
              <p className="mt-0.5 truncate text-xs text-zinc-500">{toast.filename}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onDismiss}
            className="shrink-0 rounded-lg p-1 text-zinc-500 hover:bg-white/5 hover:text-zinc-300"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
