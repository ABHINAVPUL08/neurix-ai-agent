"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";
import { useIsMobile } from "@/hooks/useIsMobile";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

type Particle = {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  driftY: number;
  driftX: number;
};

export function ParticleField() {
  const isMobile = useIsMobile();
  const reducedMotion = usePrefersReducedMotion();
  const count = reducedMotion ? 0 : isMobile ? 8 : 28;

  const particles = useMemo<Particle[]>(() => {
    if (count === 0) return [];
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 2 + Math.random() * (isMobile ? 2 : 3),
      duration: (isMobile ? 18 : 12) + Math.random() * (isMobile ? 14 : 18),
      driftY: -20 - Math.random() * (isMobile ? 24 : 40),
      driftX: (Math.random() - 0.5) * (isMobile ? 12 : 20),
    }));
  }, [count, isMobile]);

  if (count === 0) return null;

  const glowMultiplier = isMobile ? 2 : 3;
  const maxOpacity = isMobile ? 0.4 : 0.55;

  return (
    <div
      className="pointer-events-none fixed inset-0 overflow-hidden"
      style={{ contain: "strict" }}
      aria-hidden
    >
      {particles.map((p) => (
        <motion.span
          key={p.id}
          className="absolute rounded-full bg-purple-400/40"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            boxShadow: `0 0 ${p.size * glowMultiplier}px rgba(168,85,247,0.45)`,
          }}
          animate={{
            y: [0, p.driftY, 0],
            x: [0, p.driftX, 0],
            opacity: [0.12, maxOpacity, 0.12],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
