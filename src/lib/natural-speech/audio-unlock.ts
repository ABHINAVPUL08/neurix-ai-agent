"use client";

let audioUnlocked = false;

/** Unlock audio on mobile (Chrome autoplay / suspended AudioContext). */
export async function unlockSpeechAudio(): Promise<void> {
  if (audioUnlocked || typeof window === "undefined") return;

  const w = window as Window & {
    AudioContext?: typeof AudioContext;
    webkitAudioContext?: typeof AudioContext;
  };
  const AudioCtx = w.AudioContext ?? w.webkitAudioContext;
  if (!AudioCtx) {
    audioUnlocked = true;
    return;
  }

  try {
    const ctx = new AudioCtx();
    if (ctx.state === "suspended") {
      await ctx.resume();
    }
    const buffer = ctx.createBuffer(1, 1, 22050);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.start(0);
    source.stop(0);
    await ctx.close();
  } catch {
    // Best-effort unlock only
  }

  audioUnlocked = true;
}

export function isSpeechAudioUnlocked(): boolean {
  return audioUnlocked;
}
