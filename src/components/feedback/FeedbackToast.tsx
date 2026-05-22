"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, AlertCircle, X } from "lucide-react";

export type FeedbackToastState = {
  type: "success" | "error";
  message: string;
} | null;

type FeedbackToastProps = {
  toast: FeedbackToastState;
  onDismiss: () => void;
};

export function FeedbackToast({ toast, onDismiss }: FeedbackToastProps) {
  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 12, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.96 }}
          className="fixed bottom-[4.75rem] right-4 z-[76] flex w-[min(320px,calc(100%-6rem))] items-start gap-2.5 rounded-xl border border-purple-500/35 bg-[#12081f]/95 px-3.5 py-3 shadow-[0_8px_32px_rgba(0,0,0,0.45),0_0_24px_rgba(168,85,247,0.18)] backdrop-blur-xl sm:bottom-[5.5rem] sm:right-6"
          role="status"
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
          ) : (
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
          )}
          <p className="min-w-0 flex-1 text-sm font-medium text-zinc-100">
            {toast.message}
          </p>
          <button
            type="button"
            onClick={onDismiss}
            className="shrink-0 rounded-lg p-1 text-zinc-500 hover:bg-white/5 hover:text-zinc-300"
            aria-label="Dismiss"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
