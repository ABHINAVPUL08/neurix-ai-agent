import type { SpeechLanguage } from "@/lib/natural-speech/detect-speech-language";

/** OpenAI neural TTS — natural female voice for Hindi / Hinglish */
export const OPENAI_TTS_MODEL = "tts-1-hd";

/** Warm, natural female voice (OpenAI: shimmer) */
export const OPENAI_TTS_VOICE = "shimmer";

export const OPENAI_TTS_SPEED = 1;

export const MAX_TTS_INPUT_CHARS = 4096;

export function usesCloudTts(language: SpeechLanguage): boolean {
  return language === "hinglish" || language === "hindi";
}
