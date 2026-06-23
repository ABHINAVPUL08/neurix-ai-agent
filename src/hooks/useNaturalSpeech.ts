"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";
import { unlockSpeechAudio } from "@/lib/natural-speech/audio-unlock";
import {
  ensureVoicesReady,
  warmSpeechVoices,
} from "@/lib/natural-speech/voice-loader";
import { speechController } from "@/lib/speech-controller";
import { getVoiceMuted, subscribeVoiceMuted } from "@/lib/voice-settings";

function subscribeSpeaking(onStoreChange: () => void) {
  return speechController.subscribeSpeaking(onStoreChange);
}

function getSpeakingSnapshot() {
  return !!speechController.getActiveId();
}

export function useNaturalSpeech() {
  const isSpeaking = useSyncExternalStore(
    subscribeSpeaking,
    getSpeakingSnapshot,
    () => false,
  );

  const voiceMuted = useSyncExternalStore(
    subscribeVoiceMuted,
    getVoiceMuted,
    () => false,
  );

  const supported = useSyncExternalStore(
    () => () => undefined,
    () => speechController.isSupported(),
    () => false,
  );

  useEffect(() => {
    warmSpeechVoices();
    void ensureVoicesReady();

    const unlockOnGesture = () => {
      void unlockSpeechAudio();
    };
    window.addEventListener("pointerdown", unlockOnGesture, { once: true });
    return () => window.removeEventListener("pointerdown", unlockOnGesture);
  }, []);

  const prepare = useCallback(async () => {
    await unlockSpeechAudio();
    await ensureVoicesReady();
  }, []);

  const speak = useCallback((messageId: string, text: string) => {
    if (getVoiceMuted()) return;
    void unlockSpeechAudio();
    speechController.speak(messageId, text);
  }, []);

  const stop = useCallback(() => {
    speechController.stop();
  }, []);

  const interrupt = useCallback(() => {
    speechController.stop();
  }, []);

  return {
    supported,
    isSpeaking,
    voiceMuted,
    voiceOutputEnabled: supported && !voiceMuted,
    speak,
    stop,
    interrupt,
    prepare,
  };
}
