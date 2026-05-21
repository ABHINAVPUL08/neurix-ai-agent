import { cleanTextForSpeech } from "@/lib/clean-text-for-speech";

/** Global speech state so only one AI message plays at a time */

type SpeechListener = (activeId: string | null) => void;

/** Preferred natural voices (browser-dependent availability) */
const PREFERRED_VOICE_NAMES = [
  "Google US English",
  "Samantha",
  "Microsoft Aria Online",
  "Microsoft Aria",
  "Microsoft Jenny",
  "Karen",
  "Daniel",
  "Moira",
  "Tessa",
];

const SPEECH_RATE = 0.9;
const SPEECH_PITCH = 1;
const SPEECH_VOLUME = 1;

class SpeechController {
  private activeId: string | null = null;
  private listeners = new Set<SpeechListener>();
  private voicesCache: SpeechSynthesisVoice[] = [];

  subscribe(listener: SpeechListener): () => void {
    this.listeners.add(listener);
    listener(this.activeId);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    for (const listener of this.listeners) {
      listener(this.activeId);
    }
  }

  isSupported(): boolean {
    return typeof window !== "undefined" && "speechSynthesis" in window;
  }

  isPlaying(messageId: string): boolean {
    return this.activeId === messageId;
  }

  getActiveId(): string | null {
    return this.activeId;
  }

  private refreshVoices(): SpeechSynthesisVoice[] {
    if (!this.isSupported()) return [];
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) this.voicesCache = voices;
    return this.voicesCache;
  }

  /** Pick the most natural English voice available on this device */
  pickNaturalVoice(): SpeechSynthesisVoice | undefined {
    const voices = this.refreshVoices();
    const enVoices = voices.filter((v) => v.lang.startsWith("en"));

    for (const preferred of PREFERRED_VOICE_NAMES) {
      const match = enVoices.find((v) =>
        v.name.toLowerCase().includes(preferred.toLowerCase()),
      );
      if (match) return match;
    }

    const natural = enVoices.find(
      (v) =>
        /google|natural|premium|neural|aria|samantha/i.test(v.name) &&
        v.lang.startsWith("en-US"),
    );
    if (natural) return natural;

    const us = enVoices.find((v) => v.lang === "en-US");
    return us ?? enVoices[0];
  }

  stop(): void {
    if (!this.isSupported()) return;
    window.speechSynthesis.cancel();
    this.activeId = null;
    this.notify();
  }

  speak(messageId: string, rawText: string): void {
    if (!this.isSupported()) return;

    const text = cleanTextForSpeech(rawText);
    if (!text) return;

    // Stop any in-flight speech before starting new audio
    window.speechSynthesis.cancel();
    this.activeId = null;
    this.notify();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = SPEECH_RATE;
    utterance.pitch = SPEECH_PITCH;
    utterance.volume = SPEECH_VOLUME;
    utterance.lang = "en-US";

    const voice = this.pickNaturalVoice();
    if (voice) utterance.voice = voice;

    utterance.onstart = () => {
      this.activeId = messageId;
      this.notify();
    };

    utterance.onend = () => {
      if (this.activeId === messageId) {
        this.activeId = null;
        this.notify();
      }
    };

    utterance.onerror = (event) => {
      if (event.error === "interrupted" || event.error === "canceled") return;
      if (this.activeId === messageId) {
        this.activeId = null;
        this.notify();
      }
    };

    // Small delay after cancel() — required on some browsers (Chrome/Safari)
    window.setTimeout(() => {
      window.speechSynthesis.speak(utterance);
    }, 50);
  }

  toggle(messageId: string, text: string): void {
    if (this.activeId === messageId) {
      this.stop();
    } else {
      this.speak(messageId, text);
    }
  }
}

export const speechController = new SpeechController();

/** Preload voices (iOS/Safari loads asynchronously) */
export function warmSpeechVoices(): void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

  const load = () => window.speechSynthesis.getVoices();
  load();
  window.speechSynthesis.onvoiceschanged = load;
}
