"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import type { OrbState } from "@/types/chat";

type AiOrbProps = {
  state: OrbState;
  className?: string;
};

const STATE_CONFIG = {
  idle: { scale: [1, 1.04, 1], glow: "0 0 48px rgba(168,85,247,0.45)" },
  thinking: { scale: [1, 1.08, 1], glow: "0 0 64px rgba(168,85,247,0.65)" },
  speaking: { scale: [1, 1.12, 1], glow: "0 0 72px rgba(192,132,252,0.75)" },
  listening: { scale: [1, 1.1, 1], glow: "0 0 56px rgba(244,114,182,0.5)" },
};

export function AiOrb({ state, className = "" }: AiOrbProps) {
  const cfg = STATE_CONFIG[state];

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <motion.div
        className="absolute h-full w-full max-h-32 max-w-32 rounded-full bg-purple-500/25 blur-3xl"
        animate={{ opacity: state === "idle" ? 0.35 : 0.7, scale: cfg.scale }}
        transition={{ duration: state === "thinking" ? 2 : 1.2, repeat: Infinity }}
      />
      {[...Array(3)].map((_, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full border border-purple-400/30"
          style={{ width: 80 + i * 28, height: 80 + i * 28 }}
          animate={{
            scale: state === "speaking" ? [1, 1.15, 1] : [1, 1.05, 1],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: 1.5 + i * 0.3,
            repeat: Infinity,
            delay: i * 0.2,
          }}
        />
      ))}
      <motion.div
        className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 via-violet-600 to-fuchsia-600 ring-2 ring-purple-300/40 sm:h-24 sm:w-24"
        animate={{ scale: cfg.scale, boxShadow: cfg.glow }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <Sparkles className="h-8 w-8 text-white sm:h-9 sm:w-9" />
      </motion.div>
    </div>
  );
}
