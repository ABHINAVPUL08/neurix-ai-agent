const VOICE_MUTED_KEY = "neurix-voice-muted";

export function getVoiceMuted(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(VOICE_MUTED_KEY) === "true";
  } catch {
    return false;
  }
}

export function setVoiceMuted(muted: boolean): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(VOICE_MUTED_KEY, muted ? "true" : "false");
    window.dispatchEvent(
      new CustomEvent("neurix-voice-settings-changed", { detail: { muted } }),
    );
  } catch {
    // ignore quota errors
  }
}

export function subscribeVoiceMuted(
  listener: (muted: boolean) => void,
): () => void {
  if (typeof window === "undefined") return () => undefined;
  const handler = (event: Event) => {
    const detail = (event as CustomEvent<{ muted: boolean }>).detail;
    listener(detail?.muted ?? getVoiceMuted());
  };
  window.addEventListener("neurix-voice-settings-changed", handler);
  listener(getVoiceMuted());
  return () =>
    window.removeEventListener("neurix-voice-settings-changed", handler);
}
