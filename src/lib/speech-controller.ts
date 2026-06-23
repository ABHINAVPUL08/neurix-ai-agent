import { unlockSpeechAudio } from "@/lib/natural-speech/audio-unlock";
import { chunkTextForSpeech } from "@/lib/natural-speech/chunk-speech";
import {
  cloudAudioPlayer,
  fetchIndianTtsAudio,
} from "@/lib/natural-speech/cloud-audio-player";
import { refineIndianTtsPronunciation } from "@/lib/natural-speech/refine-indian-tts-pronunciation";
import { prepareSpeechText } from "@/lib/natural-speech/prepare-speech-text";
import { getSpeechLanguageProfile } from "@/lib/natural-speech/speech-language-settings";
import { usesCloudTts } from "@/lib/natural-speech/tts-config";
import { pickNaturalVoice } from "@/lib/natural-speech/voice-selection";
import type { SpeechLanguage } from "@/lib/natural-speech/detect-speech-language";
import {
  ensureVoicesReady,
  warmSpeechVoices,
} from "@/lib/natural-speech/voice-loader";
import { getVoiceMuted } from "@/lib/voice-settings";

export { warmSpeechVoices, ensureVoicesReady };

type SpeechListener = (activeId: string | null) => void;

type SpeechSegment = { text: string; pauseAfterMs: number };

const START_DELAY_MS = 35;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function buildSpeechSegments(
  chunks: string[],
  profile: ReturnType<typeof getSpeechLanguageProfile>,
): SpeechSegment[] {
  return chunks.map((chunk, index) => ({
    text: chunk,
    pauseAfterMs: index < chunks.length - 1 ? profile.pauseMs : 0,
  }));
}

class SpeechController {
  private activeId: string | null = null;
  private listeners = new Set<SpeechListener>();
  private voiceCache = new Map<SpeechLanguage, SpeechSynthesisVoice>();
  private playbackGeneration = 0;

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
    if (typeof window === "undefined") return false;
    return "speechSynthesis" in window || typeof Audio !== "undefined";
  }

  isPlaying(messageId: string): boolean {
    return this.activeId === messageId;
  }

  getActiveId(): string | null {
    return this.activeId;
  }

  subscribeSpeaking(onChange: () => void): () => void {
    return this.subscribe(() => onChange());
  }

  private async resolveVoice(
    language: SpeechLanguage,
  ): Promise<SpeechSynthesisVoice | undefined> {
    const cached = this.voiceCache.get(language);
    if (cached) return cached;

    const voices = await ensureVoicesReady();
    const voice = pickNaturalVoice(voices, language);
    if (voice) this.voiceCache.set(language, voice);
    return voice;
  }

  stop(): void {
    if (typeof window === "undefined") return;
    this.playbackGeneration += 1;
    cloudAudioPlayer.stop();
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    this.activeId = null;
    this.notify();
  }

  speak(messageId: string, rawText: string): void {
    if (!this.isSupported() || getVoiceMuted()) return;

    const { text, language } = prepareSpeechText(rawText);
    if (!text.trim()) return;

    this.playbackGeneration += 1;
    const generation = this.playbackGeneration;

    cloudAudioPlayer.stop();
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    this.activeId = null;
    this.notify();

    if (usesCloudTts(language)) {
      void this.playCloudTts(messageId, text, generation, language);
      return;
    }

    const chunks = chunkTextForSpeech(text, language);
    if (chunks.length === 0) return;

    const profile = getSpeechLanguageProfile(language);
    const segments = buildSpeechSegments(chunks, profile);
    void this.playBrowserSegments(
      messageId,
      segments,
      generation,
      language,
      profile,
    );
  }

  toggle(messageId: string, text: string): void {
    if (this.activeId === messageId) {
      this.stop();
    } else {
      this.speak(messageId, text);
    }
  }

  /** Natural female neural voice via OpenAI TTS (Hindi / Hinglish only). */
  private async playCloudTts(
    messageId: string,
    text: string,
    generation: number,
    language: SpeechLanguage,
  ): Promise<void> {
    await unlockSpeechAudio();
    if (generation !== this.playbackGeneration) return;

    const ttsText = refineIndianTtsPronunciation(text);
    const blob = await fetchIndianTtsAudio(ttsText);
    if (generation !== this.playbackGeneration) return;

    if (blob) {
      const played = await cloudAudioPlayer.playBlob(blob, {
        generation,
        isCurrentGeneration: () => generation === this.playbackGeneration,
        onStart: () => {
          if (generation !== this.playbackGeneration) return;
          this.activeId = messageId;
          this.notify();
        },
      });

      if (played && generation === this.playbackGeneration) {
        this.activeId = null;
        this.notify();
      }
      if (played) return;
    }

    // Fallback to browser voice if cloud TTS fails
    const chunks = chunkTextForSpeech(text, language);
    if (chunks.length === 0) return;
    const profile = getSpeechLanguageProfile(language);
    const segments = buildSpeechSegments(chunks, profile);
    await this.playBrowserSegments(
      messageId,
      segments,
      generation,
      language,
      profile,
    );
  }

  private async playBrowserSegments(
    messageId: string,
    segments: SpeechSegment[],
    generation: number,
    language: SpeechLanguage,
    profile: ReturnType<typeof getSpeechLanguageProfile>,
  ): Promise<void> {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    await unlockSpeechAudio();
    const voice = await this.resolveVoice(language);
    if (generation !== this.playbackGeneration) return;

    await delay(START_DELAY_MS);
    if (generation !== this.playbackGeneration) return;

    for (let index = 0; index < segments.length; index++) {
      if (generation !== this.playbackGeneration) return;

      const segment = segments[index];
      const started = await this.speakBrowserChunk(
        messageId,
        segment.text,
        voice,
        generation,
        profile,
      );
      if (!started || generation !== this.playbackGeneration) return;

      if (index < segments.length - 1 && segment.pauseAfterMs > 0) {
        await delay(segment.pauseAfterMs);
      }
    }

    if (generation === this.playbackGeneration && this.activeId === messageId) {
      this.activeId = null;
      this.notify();
    }
  }

  private speakBrowserChunk(
    messageId: string,
    text: string,
    voice: SpeechSynthesisVoice | undefined,
    generation: number,
    profile: ReturnType<typeof getSpeechLanguageProfile>,
  ): Promise<boolean> {
    return new Promise((resolve) => {
      if (
        generation !== this.playbackGeneration ||
        typeof window === "undefined" ||
        !("speechSynthesis" in window)
      ) {
        resolve(false);
        return;
      }

      const trimmed = text.trim();
      if (!trimmed) {
        resolve(true);
        return;
      }

      const utterance = new SpeechSynthesisUtterance(trimmed);
      utterance.rate = profile.rate;
      utterance.pitch = profile.pitch;
      utterance.volume = profile.volume;
      utterance.lang = voice?.lang ?? profile.utteranceLang;
      if (voice) utterance.voice = voice;

      let settled = false;
      const finish = (ok: boolean) => {
        if (settled) return;
        settled = true;
        resolve(ok);
      };

      utterance.onstart = () => {
        if (generation !== this.playbackGeneration) {
          window.speechSynthesis.cancel();
          finish(false);
          return;
        }
        this.activeId = messageId;
        this.notify();
      };

      utterance.onend = () => finish(true);

      utterance.onerror = (event) => {
        if (event.error === "interrupted" || event.error === "canceled") {
          finish(false);
          return;
        }
        finish(true);
      };

      window.speechSynthesis.speak(utterance);

      window.setTimeout(() => {
        if (!settled && generation !== this.playbackGeneration) {
          finish(false);
        }
      }, 120_000);
    });
  }
}

export const speechController = new SpeechController();
