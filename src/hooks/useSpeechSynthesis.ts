"use client";

import { useCallback, useSyncExternalStore } from "react";
import { unlockSpeechAudio } from "@/lib/natural-speech/audio-unlock";
import { speechController } from "@/lib/speech-controller";

type UseSpeechSynthesisOptions = {
  messageId: string;
  text: string;
};

function subscribeMessageSpeaking(onStoreChange: () => void) {
  return speechController.subscribe(() => onStoreChange());
}

export function useSpeechSynthesis({
  messageId,
  text,
}: UseSpeechSynthesisOptions) {
  const isSpeaking = useSyncExternalStore(
    subscribeMessageSpeaking,
    () => speechController.isPlaying(messageId),
    () => false,
  );

  const isSupported = useSyncExternalStore(
    () => () => undefined,
    () => speechController.isSupported(),
    () => false,
  );

  const toggle = useCallback(() => {
    void unlockSpeechAudio();
    speechController.toggle(messageId, text);
  }, [messageId, text]);

  const stop = useCallback(() => {
    if (speechController.isPlaying(messageId)) {
      speechController.stop();
    }
  }, [messageId]);

  return { isSpeaking, isSupported, toggle, stop };
}
