"use client";

import { memo } from "react";
import { BackgroundOrbs } from "@/components/BackgroundOrbs";
import { ParticleField } from "@/components/effects/ParticleField";
import { ParallaxGlow } from "@/components/effects/ParallaxGlow";

function BackgroundEffectsInner() {
  return (
    <>
      <BackgroundOrbs />
      <ParticleField />
      <ParallaxGlow />
    </>
  );
}

export const BackgroundEffects = memo(BackgroundEffectsInner);
