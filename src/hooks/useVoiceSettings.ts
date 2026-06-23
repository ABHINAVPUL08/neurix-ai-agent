"use client";

import { useCallback, useSyncExternalStore } from "react";
import {
  getVoiceMuted,
  setVoiceMuted as persistVoiceMuted,
  subscribeVoiceMuted,
} from "@/lib/voice-settings";

export function useVoiceSettings() {
  const voiceMuted = useSyncExternalStore(
    subscribeVoiceMuted,
    getVoiceMuted,
    () => false,
  );

  const toggleVoiceMuted = useCallback(() => {
    const next = !getVoiceMuted();
    persistVoiceMuted(next);
    return next;
  }, []);

  const setVoiceMuted = useCallback((muted: boolean) => {
    persistVoiceMuted(muted);
  }, []);

  return {
    hydrated: true,
    voiceMuted,
    toggleVoiceMuted,
    setVoiceMuted,
    voiceOutputEnabled: !voiceMuted,
  };
}
