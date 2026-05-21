"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

const CALENDLY_URL =
  process.env.NEXT_PUBLIC_CALENDLY_URL ??
  "https://calendly.com/neurix-ai/consultation";

type CalendlyModalProps = {
  open: boolean;
  onClose: () => void;
};

export function CalendlyModal({ open, onClose }: CalendlyModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="glass-premium fixed left-1/2 top-1/2 z-[101] flex h-[85vh] w-[calc(100%-2rem)] max-w-2xl -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-2xl"
          >
            <div className="flex items-center justify-between border-b border-purple-500/20 px-4 py-3">
              <h2 className="text-sm font-semibold text-white">
                Book a Neurix consultation
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800/50 hover:text-white"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <iframe
              src={CALENDLY_URL}
              title="Book consultation"
              className="min-h-0 flex-1 w-full bg-white"
            />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
