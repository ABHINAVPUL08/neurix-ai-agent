"use client";

import { motion } from "framer-motion";

export function BackgroundOrbs() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
      <div className="noise-overlay absolute inset-0" />
      <motion.div
        className="absolute -left-40 top-[10%] h-[28rem] w-[28rem] rounded-full bg-purple-600/25 blur-[130px]"
        animate={{ x: [0, 60, 0], y: [0, -30, 0], scale: [1, 1.08, 1] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -right-32 top-[25%] h-96 w-96 rounded-full bg-violet-500/20 blur-[110px]"
        animate={{ x: [0, -50, 0], y: [0, 40, 0] }}
        transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-[5%] left-[30%] h-80 w-80 rounded-full bg-fuchsia-600/15 blur-[100px]"
        animate={{ y: [0, -25, 0], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-[55%] right-[20%] h-64 w-64 rounded-full bg-indigo-500/15 blur-[90px]"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}
