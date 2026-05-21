"use client";

import { useEffect, useState } from "react";
import { speechController } from "@/lib/speech-controller";
import type { OrbState } from "@/types/chat";

export function useOrbState(
  isLoading: boolean,
  isStreaming: boolean,
): OrbState {
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    return speechController.subscribe((activeId) => {
      setIsSpeaking(!!activeId);
    });
  }, []);

  if (isSpeaking) return "speaking";
  if (isLoading || isStreaming) return "thinking";
  return "idle";
}
