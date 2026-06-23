"use client";

const VOICES_READY_TIMEOUT_MS = 2800;

export function getSpeechVoices(): SpeechSynthesisVoice[] {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return [];
  }
  return window.speechSynthesis.getVoices();
}

/** Wait until the browser exposes voices (voiceschanged or timeout). */
export function ensureVoicesReady(
  timeoutMs = VOICES_READY_TIMEOUT_MS,
): Promise<SpeechSynthesisVoice[]> {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return Promise.resolve([]);
  }

  const existing = getSpeechVoices();
  if (existing.length > 0) return Promise.resolve(existing);

  return new Promise((resolve) => {
    const synth = window.speechSynthesis;

    const finish = () => {
      cleanup();
      resolve(getSpeechVoices());
    };

    const onVoicesChanged = () => {
      if (getSpeechVoices().length > 0) finish();
    };

    const cleanup = () => {
      clearTimeout(timer);
      synth.removeEventListener("voiceschanged", onVoicesChanged);
    };

    const timer = window.setTimeout(finish, timeoutMs);
    synth.addEventListener("voiceschanged", onVoicesChanged);
    synth.getVoices();
  });
}

let warmListenerAttached = false;

/** Preload voices as early as possible (call once on app mount). */
export function warmSpeechVoices(): void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  if (warmListenerAttached) {
    window.speechSynthesis.getVoices();
    return;
  }

  warmListenerAttached = true;
  const refresh = () => {
    window.speechSynthesis.getVoices();
  };
  refresh();
  window.speechSynthesis.addEventListener("voiceschanged", refresh);
}
