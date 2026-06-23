"use client";

import Image from "next/image";
import { memo } from "react";

const LOGO_SRC = "/neurix-logo.jpg";

const SIZE_MAP = {
  sm: 32,
  md: 36,
  lg: 48,
  xl: 64,
  hero: 88,
} as const;

type NeurixLogoProps = {
  size?: keyof typeof SIZE_MAP;
  className?: string;
  glow?: boolean;
};

function NeurixLogoInner({
  size = "md",
  className = "",
  glow = false,
}: NeurixLogoProps) {
  const px = SIZE_MAP[size];
  const pad = size === "hero" ? 6 : size === "xl" ? 4 : 3;

  return (
    <div
      className={`relative shrink-0 overflow-hidden rounded-xl bg-white shadow-[0_0_20px_rgba(168,85,247,0.25)] ring-1 ring-purple-400/20 ${
        glow
          ? "shadow-[0_0_40px_rgba(59,130,246,0.35),0_0_56px_rgba(168,85,247,0.35)]"
          : ""
      } ${className}`}
      style={{ width: px + pad * 2, height: px + pad * 2, padding: pad }}
    >
      <Image
        src={LOGO_SRC}
        alt="Neurix logo"
        width={px}
        height={px}
        className="h-full w-full object-contain"
        priority={size === "hero" || size === "xl"}
      />
    </div>
  );
}

export const NeurixLogo = memo(NeurixLogoInner);
