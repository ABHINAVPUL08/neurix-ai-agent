"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import {
  detectSpeechLanguage,
  recognitionLangForLanguage,
} from "@/lib/natural-speech/detect-speech-language";

const DEFAULT_SILENCE_MS = 1800;
const INTERIM_DEBOUNCE_MS = 32;

function getSpeechRecognitionCtor(): (new () => SpeechRecognition) | null {
  if (typeof window === "undefined") return null;
  const w = window as Window & typeof globalThis;
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export type UseSpeechRecognitionOptions = {
  lang?: string;
  silenceMs?: number;
  /** Live transcript updates while speaking */
  onInterim?: (text: string) => void;
  /** Fired when a phrase is finalized or listening ends — use to sync textbox, not auto-send */
  onTranscriptCommit?: (text: string) => void;
  onListeningChange?: (listening: boolean) => void;
  onSpeechDetected?: () => void;
  onError?: (message: string) => void;
};

export function useSpeechRecognition({
  lang = "en-IN",
  silenceMs = DEFAULT_SILENCE_MS,
  onInterim,
  onTranscriptCommit,
  onListeningChange,
  onSpeechDetected,
  onError,
}: UseSpeechRecognitionOptions = {}) {
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState("");
  const isSupported = useSyncExternalStore(
    () => () => undefined,
    () => !!getSpeechRecognitionCtor(),
    () => false,
  );

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const interimTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const committedRef = useRef("");
  const liveTranscriptRef = useRef("");
  const listeningRef = useRef(false);
  const lastCommitRef = useRef("");

  const callbacksRef = useRef({
    onInterim,
    onTranscriptCommit,
    onListeningChange,
    onSpeechDetected,
    onError,
  });
  useEffect(() => {
    callbacksRef.current = {
      onInterim,
      onTranscriptCommit,
      onListeningChange,
      onSpeechDetected,
      onError,
    };
  }, [onInterim, onTranscriptCommit, onListeningChange, onSpeechDetected, onError]);

  const clearSilenceTimer = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  }, []);

  const clearInterimTimer = useCallback(() => {
    if (interimTimerRef.current) {
      clearTimeout(interimTimerRef.current);
      interimTimerRef.current = null;
    }
  }, []);

  const emitInterim = useCallback(
    (text: string, immediate = false) => {
      liveTranscriptRef.current = text;
      setInterimTranscript(text);
      clearInterimTimer();
      const fire = () => callbacksRef.current.onInterim?.(text);
      if (immediate) {
        fire();
        return;
      }
      interimTimerRef.current = setTimeout(fire, INTERIM_DEBOUNCE_MS);
    },
    [clearInterimTimer],
  );

  const commitTranscript = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || trimmed === lastCommitRef.current) return;
      lastCommitRef.current = trimmed;
      clearSilenceTimer();
      clearInterimTimer();
      emitInterim(trimmed, true);
      callbacksRef.current.onTranscriptCommit?.(trimmed);
    },
    [clearInterimTimer, clearSilenceTimer, emitInterim],
  );

  const scheduleSilenceStop = useCallback(() => {
    clearSilenceTimer();
    silenceTimerRef.current = setTimeout(() => {
      if (!listeningRef.current) return;
      const full = liveTranscriptRef.current.trim();
      if (full) commitTranscript(full);
      const recognition = recognitionRef.current;
      if (recognition) {
        try {
          recognition.stop();
        } catch {
          // ignore
        }
      }
    }, silenceMs);
  }, [clearSilenceTimer, commitTranscript, silenceMs]);

  const stopInternal = useCallback(() => {
    clearSilenceTimer();
    clearInterimTimer();
    listeningRef.current = false;
    const recognition = recognitionRef.current;
    if (recognition) {
      try {
        recognition.onresult = null;
        recognition.onerror = null;
        recognition.onend = null;
        recognition.onstart = null;
        recognition.onspeechstart = null;
        recognition.abort();
      } catch {
        try {
          recognition.stop();
        } catch {
          // already stopped
        }
      }
      recognitionRef.current = null;
    }
    setIsListening(false);
    callbacksRef.current.onListeningChange?.(false);
  }, [clearInterimTimer, clearSilenceTimer]);

  const resolveRecognitionLang = useCallback(
    (transcriptHint?: string) => {
      if (lang && lang !== "en-IN") return lang;
      if (transcriptHint?.trim()) {
        return recognitionLangForLanguage(detectSpeechLanguage(transcriptHint));
      }
      return "en-IN";
    },
    [lang],
  );

  const start = useCallback(
    (seedText = "") => {
      const Ctor = getSpeechRecognitionCtor();
      if (!Ctor) {
        callbacksRef.current.onError?.(
          "Speech recognition is not supported in this browser.",
        );
        return;
      }

      stopInternal();
      lastCommitRef.current = "";

      const seed = seedText.trim();
      committedRef.current = seed;
      liveTranscriptRef.current = seed;
      if (seed) emitInterim(seed, true);

      listeningRef.current = true;
      setIsListening(true);
      callbacksRef.current.onListeningChange?.(true);

      const recognition = new Ctor();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = resolveRecognitionLang(seed);
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        listeningRef.current = true;
      };

      recognition.onspeechstart = () => {
        callbacksRef.current.onSpeechDetected?.();
        scheduleSilenceStop();
      };

      recognition.onresult = (event) => {
        let interim = "";
        let finalChunk = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          const text = result[0]?.transcript ?? "";
          if (!text) continue;
          if (result.isFinal) {
            finalChunk += text;
          } else {
            interim += text;
          }
        }

        if (finalChunk) {
          const piece = finalChunk.trim();
          if (piece) {
            committedRef.current = committedRef.current
              ? `${committedRef.current} ${piece}`.replace(/\s+/g, " ").trim()
              : piece;
          }
          emitInterim(committedRef.current, true);
          scheduleSilenceStop();
        } else if (interim.trim()) {
          const combined = committedRef.current
            ? `${committedRef.current} ${interim.trim()}`.replace(/\s+/g, " ")
            : interim.trim();
          emitInterim(combined);
          scheduleSilenceStop();
        }
      };

      recognition.onerror = (event) => {
        if (event.error === "aborted") return;
        if (event.error === "not-allowed") {
          callbacksRef.current.onError?.(
            "Microphone access denied. Allow microphone permission to use voice.",
          );
        } else if (event.error === "no-speech") {
          callbacksRef.current.onError?.("No speech detected. Try again.");
        } else if (event.error !== "no-speech") {
          callbacksRef.current.onError?.(
            "Voice input failed. Check your microphone and try again.",
          );
        }
        stopInternal();
      };

      recognition.onend = () => {
        const full = liveTranscriptRef.current.trim();
        listeningRef.current = false;
        recognitionRef.current = null;
        setIsListening(false);
        setInterimTranscript("");
        callbacksRef.current.onListeningChange?.(false);

        if (full) commitTranscript(full);

        committedRef.current = "";
        liveTranscriptRef.current = "";
      };

      recognitionRef.current = recognition;

      try {
        recognition.start();
      } catch {
        callbacksRef.current.onError?.("Could not start microphone.");
        stopInternal();
      }
    },
    [
      emitInterim,
      resolveRecognitionLang,
      scheduleSilenceStop,
      stopInternal,
      commitTranscript,
    ],
  );

  const stop = useCallback(() => {
    const full = liveTranscriptRef.current.trim();
    if (full) commitTranscript(full);
    const recognition = recognitionRef.current;
    if (recognition) {
      try {
        recognition.stop();
      } catch {
        stopInternal();
      }
      return;
    }
    stopInternal();
  }, [commitTranscript, stopInternal]);

  const toggle = useCallback(
    (seedText = "") => {
      if (listeningRef.current) {
        stop();
      } else {
        start(seedText);
      }
    },
    [start, stop],
  );

  useEffect(() => {
    return () => {
      stopInternal();
    };
  }, [stopInternal]);

  return {
    isSupported,
    isListening,
    interimTranscript,
    start,
    stop,
    toggle,
  };
}
