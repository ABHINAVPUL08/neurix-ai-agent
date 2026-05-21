"use client";

import { motion, AnimatePresence } from "framer-motion";
import { FileText, Sparkles } from "lucide-react";

type ExportLoaderModalProps = {
  open: boolean;
  progress: number;
};

export function ExportLoaderModal({ open, progress }: ExportLoaderModalProps) {
  const pct = Math.min(100, Math.max(0, Math.round(progress)));

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="export-loader-overlay fixed inset-0 z-[90] flex items-center justify-center bg-black/70 p-4 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          aria-labelledby="export-loader-title"
          aria-busy="true"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.25 }}
            className="export-loader-card w-full max-w-md rounded-2xl border border-purple-500/35 bg-gradient-to-br from-[#1a0f2e]/98 via-[#12081f]/98 to-black/95 p-8 shadow-[0_0_60px_rgba(124,58,237,0.25)]"
          >
            <div className="mb-6 flex justify-center">
              <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-500/20 ring-1 ring-purple-400/40">
                <FileText className="h-8 w-8 text-purple-200" />
                <motion.div
                  className="absolute -right-1 -top-1"
                  animate={{ rotate: [0, 15, -15, 0] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  <Sparkles className="h-5 w-5 text-violet-300" />
                </motion.div>
              </div>
            </div>

            <h2
              id="export-loader-title"
              className="text-center text-lg font-bold text-white"
            >
              Generating AI Business Report…
            </h2>
            <p className="mt-2 text-center text-sm text-zinc-400">
              Building your branded Neurix audit on our servers — this won&apos;t
              freeze your browser.
            </p>

            <div className="mt-8">
              <div className="mb-2 flex justify-between text-xs text-zinc-500">
                <span>Preparing document</span>
                <span>{pct}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-purple-950/80 ring-1 ring-purple-500/25">
                <motion.div
                  className="export-loader-progress h-full rounded-full bg-gradient-to-r from-purple-500 via-violet-500 to-purple-400"
                  initial={{ width: "0%" }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                />
              </div>
            </div>

            <div className="mt-6 flex justify-center gap-1.5">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="h-2 w-2 rounded-full bg-purple-400"
                  animate={{ opacity: [0.3, 1, 0.3], scale: [0.85, 1.1, 0.85] }}
                  transition={{
                    repeat: Infinity,
                    duration: 1.1,
                    delay: i * 0.2,
                  }}
                />
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
