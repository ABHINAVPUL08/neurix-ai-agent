"use client";

import { useCallback, useEffect, useState } from "react";
import { speechController } from "@/lib/speech-controller";

type UseSpeechSynthesisOptions = {
  messageId: string;
  text: string;
};

export function useSpeechSynthesis({ messageId, text }: UseSpeechSynthesisOptions) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    setIsSupported(speechController.isSupported());
    return speechController.subscribe((activeId) => {
      setIsSpeaking(activeId === messageId);
    });
  }, [messageId]);

  const toggle = useCallback(() => {
    speechController.toggle(messageId, text);
  }, [messageId, text]);

  const stop = useCallback(() => {
    if (speechController.isPlaying(messageId)) {
      speechController.stop();
    }
  }, [messageId]);

  return { isSpeaking, isSupported, toggle, stop };
}
