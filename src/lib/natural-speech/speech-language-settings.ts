import type { SpeechLanguage } from "@/lib/natural-speech/detect-speech-language";

export type SpeechLanguageProfile = {
  rate: number;
  pitch: number;
  volume: number;
  pauseMs: number;
  clausePauseMs: number;
  utteranceLang: string;
  recognitionLang: string;
};

const PROFILES: Record<SpeechLanguage, SpeechLanguageProfile> = {
  english: {
    rate: 0.92,
    pitch: 1,
    volume: 1,
    pauseMs: 220,
    clausePauseMs: 0,
    utteranceLang: "en-US",
    recognitionLang: "en-IN",
  },
  hinglish: {
    rate: 0.9,
    pitch: 1,
    volume: 1,
    pauseMs: 160,
    clausePauseMs: 0,
    utteranceLang: "en-IN",
    recognitionLang: "en-IN",
  },
  hindi: {
    rate: 0.88,
    pitch: 1,
    volume: 1,
    pauseMs: 180,
    clausePauseMs: 0,
    utteranceLang: "en-IN",
    recognitionLang: "hi-IN",
  },
};

export function getSpeechLanguageProfile(
  language: SpeechLanguage,
): SpeechLanguageProfile {
  return PROFILES[language];
}

/** Hindi content is spoken via conversational en-IN Hinglish for natural founder tone. */
export function resolveTtsLanguage(
  detected: SpeechLanguage,
): SpeechLanguage {
  if (detected === "hindi") return "hinglish";
  return detected;
}
