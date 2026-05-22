"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { Bot } from "lucide-react";
import { UploadProgressBar } from "@/components/chat/UploadProgressBar";

type TypingLoaderProps = {
  status?: "thinking" | "analyzing" | "generating";
  uploadProgress?: number;
};

const STATUS_LABELS = {
  thinking: "Neurix is thinking...",
  analyzing: "Analyzing your request...",
  generating: "Building recommendations...",
};

function TypingLoaderInner({
  status = "thinking",
  uploadProgress,
}: TypingLoaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="flex gap-4"
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600/50 to-violet-800/50 ring-1 ring-purple-400/40 shadow-[0_0_28px_rgba(168,85,247,0.3)]">
        <Bot className="h-5 w-5 text-purple-200" />
      </div>
      <div className="glass-panel flex flex-col gap-2 rounded-2xl rounded-tl-lg px-5 py-4 sm:px-6 sm:py-5">
        <div className="flex items-center gap-2.5">
          <motion.span
            className="h-2.5 w-2.5 rounded-full bg-purple-400"
            animate={{ opacity: [0.35, 1, 0.35], scale: [1, 1.25, 1] }}
            transition={{ duration: 1.2, repeat: Infinity }}
          />
          <span className="text-sm font-medium text-purple-200/95 sm:text-base">
            {STATUS_LABELS[status]}
          </span>
        </div>
        {uploadProgress != null && uploadProgress > 0 ? (
          <UploadProgressBar
            progress={uploadProgress}
            label={
              uploadProgress < 92
                ? "Uploading & analyzing document…"
                : "Finalizing analysis…"
            }
          />
        ) : (
          <div className="flex gap-1.5">
            <span className="typing-dot h-2 w-2 rounded-full bg-purple-400" />
            <span className="typing-dot h-2 w-2 rounded-full bg-purple-400" />
            <span className="typing-dot h-2 w-2 rounded-full bg-purple-400" />
          </div>
        )}
      </div>
    </motion.div>
  );
}

export const TypingLoader = memo(TypingLoaderInner);
