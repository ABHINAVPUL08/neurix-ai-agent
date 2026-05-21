"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export function EmptyStateOrb() {
  return (
    <div className="relative flex flex-col items-center">
      <motion.div
        className="absolute h-32 w-32 rounded-full bg-purple-500/30 blur-3xl sm:h-40 sm:w-40"
        animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        aria-hidden
      />
      <motion.div
        className="breathing-orb relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 via-violet-600 to-fuchsia-600 shadow-[0_0_48px_rgba(168,85,247,0.55)] ring-2 ring-purple-400/40 sm:h-24 sm:w-24"
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      >
        <motion.div
          className="absolute inset-0 rounded-full ring-2 ring-purple-300/30"
          animate={{ scale: [1, 1.08, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        />
        <Sparkles className="relative h-9 w-9 text-white sm:h-10 sm:w-10" strokeWidth={2} />
      </motion.div>
    </div>
  );
}
