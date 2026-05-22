"use client";

import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/useIsMobile";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

export function BackgroundOrbs() {
  const isMobile = useIsMobile();
  const reducedMotion = usePrefersReducedMotion();
  const lowPower = isMobile || reducedMotion;

  const blurLg = lowPower ? "blur-[72px]" : "blur-[130px]";
  const blurMd = lowPower ? "blur-[64px]" : "blur-[110px]";
  const blurSm = lowPower ? "blur-[56px]" : "blur-[100px]";
  const blurXs = lowPower ? "blur-[48px]" : "blur-[90px]";

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
      <div className="noise-overlay absolute inset-0" />
      <motion.div
        className={`absolute -left-40 top-[10%] h-[28rem] w-[28rem] rounded-full bg-purple-600/25 ${blurLg}`}
        animate={
          lowPower
            ? { opacity: reducedMotion ? 0.4 : [0.35, 0.5, 0.35] }
            : { x: [0, 60, 0], y: [0, -30, 0], scale: [1, 1.08, 1] }
        }
        transition={{
          duration: lowPower ? 28 : 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className={`absolute -right-32 top-[25%] h-96 w-96 rounded-full bg-violet-500/20 ${blurMd}`}
        animate={
          lowPower
            ? { opacity: reducedMotion ? 0.35 : [0.3, 0.45, 0.3] }
            : { x: [0, -50, 0], y: [0, 40, 0] }
        }
        transition={{
          duration: lowPower ? 30 : 24,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className={`absolute bottom-[5%] left-[30%] h-80 w-80 rounded-full bg-fuchsia-600/15 ${blurSm}`}
        animate={{
          y: lowPower ? 0 : [0, -25, 0],
          opacity: lowPower
            ? reducedMotion
              ? 0.4
              : [0.35, 0.5, 0.35]
            : [0.35, 0.7, 0.35],
        }}
        transition={{
          duration: lowPower ? 26 : 16,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className={`absolute top-[55%] right-[20%] h-64 w-64 rounded-full bg-indigo-500/15 ${blurXs}`}
        animate={
          lowPower
            ? { opacity: reducedMotion ? 0.3 : [0.25, 0.4, 0.25] }
            : { scale: [1, 1.2, 1] }
        }
        transition={{
          duration: lowPower ? 28 : 18,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  );
}
