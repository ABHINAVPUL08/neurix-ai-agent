"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

type UploadProgressBarProps = {
  progress: number;
  label?: string;
};

function UploadProgressBarInner({
  progress,
  label = "Neurix is analyzing your project…",
}: UploadProgressBarProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm text-purple-200">
        <Loader2 className="h-4 w-4 animate-spin" />
        {label}
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-zinc-800">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-purple-500 to-violet-500"
          initial={false}
          animate={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          transition={{ ease: "easeOut", duration: 0.25 }}
        />
      </div>
      <p className="text-xs text-zinc-500">
        Extracting text · Identifying automations · Building recommendations
      </p>
    </div>
  );
}

export const UploadProgressBar = memo(UploadProgressBarInner);
