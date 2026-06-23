"use client";

import { useNaturalSpeech } from "@/hooks/useNaturalSpeech";
import { getVoiceMuted } from "@/lib/voice-settings";
import { speechController } from "@/lib/speech-controller";

/** Voice output hook — delegates to natural speech engine. */
export function useVoiceOutput() {
  const natural = useNaturalSpeech();

  const toggleMuted = () => {
    const next = !getVoiceMuted();
    if (next) speechController.stop();
    return next;
  };

  return {
    ...natural,
    toggleMuted,
  };
}
