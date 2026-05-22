"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MessageSquare } from "lucide-react";
import {
  FEEDBACK_ERROR_MESSAGE,
  FEEDBACK_SUCCESS_MESSAGE,
} from "@/lib/feedback";
import {
  FeedbackToast,
  type FeedbackToastState,
} from "@/components/feedback/FeedbackToast";

const FeedbackModal = dynamic(
  () =>
    import("@/components/feedback/FeedbackModal").then((m) => m.FeedbackModal),
  { ssr: false },
);

export function FeedbackWidget() {
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState<FeedbackToastState>(null);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 5000);
    return () => window.clearTimeout(t);
  }, [toast]);

  const handleSuccess = useCallback(() => {
    setToast({
      type: "success",
      message: FEEDBACK_SUCCESS_MESSAGE,
    });
  }, []);

  const handleError = useCallback((message: string) => {
    setToast({
      type: "error",
      message: message || FEEDBACK_ERROR_MESSAGE,
    });
  }, []);

  return (
    <>
      <motion.button
        type="button"
        onClick={() => setOpen(true)}
        whileHover={{ scale: 1.03, y: -1 }}
        whileTap={{ scale: 0.97 }}
        className="fixed bottom-5 right-4 z-[75] flex items-center gap-2 rounded-full border border-purple-400/45 bg-purple-600/35 px-3 py-2 text-purple-50 shadow-[0_0_28px_rgba(168,85,247,0.35)] backdrop-blur-md transition-shadow hover:shadow-[0_0_36px_rgba(168,85,247,0.5)] sm:bottom-6 sm:right-6 sm:gap-2.5 sm:px-4 sm:py-2.5"
        aria-label="Send feedback"
        title="Send feedback"
      >
        <MessageSquare className="h-4 w-4 shrink-0 sm:h-[18px] sm:w-[18px]" />
        <span className="text-xs font-semibold tracking-wide sm:text-sm">
          Feedback
        </span>
      </motion.button>

      {open && (
        <FeedbackModal
          open={open}
          onClose={() => setOpen(false)}
          onSuccess={handleSuccess}
          onError={handleError}
        />
      )}

      <FeedbackToast toast={toast} onDismiss={() => setToast(null)} />
    </>
  );
}
