"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import { useEffect } from "react";
import { useIsMobile } from "@/hooks/useIsMobile";

/** Mouse-reactive ambient glow layer (desktop only; static on mobile) */
export function ParallaxGlow() {
  const isMobile = useIsMobile();
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 40, damping: 20 });
  const sy = useSpring(my, { stiffness: 40, damping: 20 });

  useEffect(() => {
    if (isMobile) return;
    const onMove = (e: MouseEvent) => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      mx.set((e.clientX - cx) / cx);
      my.set((e.clientY - cy) / cy);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [mx, my, isMobile]);

  if (isMobile) {
    return (
      <div className="pointer-events-none fixed inset-0" aria-hidden>
        <div className="absolute left-1/4 top-1/3 h-64 w-64 -translate-x-1/2 rounded-full bg-purple-600/10 blur-[56px]" />
        <div className="absolute bottom-1/4 right-1/4 h-56 w-56 rounded-full bg-violet-500/8 blur-[52px]" />
      </div>
    );
  }

  return (
    <motion.div
      className="pointer-events-none fixed inset-0"
      style={{ x: sx, y: sy }}
      aria-hidden
    >
      <div className="absolute left-1/4 top-1/3 h-96 w-96 -translate-x-1/2 rounded-full bg-purple-600/15 blur-[100px]" />
      <div className="absolute right-1/4 bottom-1/4 h-80 w-80 rounded-full bg-violet-500/10 blur-[90px]" />
    </motion.div>
  );
}
