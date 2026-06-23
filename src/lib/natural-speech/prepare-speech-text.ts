import { cleanTextForSpeech } from "@/lib/clean-text-for-speech";
import {
  detectSpeechLanguage,
  type SpeechLanguage,
} from "@/lib/natural-speech/detect-speech-language";
import { humanizeIndianSpeech } from "@/lib/natural-speech/humanize-indian-speech";
import { resolveTtsLanguage } from "@/lib/natural-speech/speech-language-settings";

const PRONUNCIATION_REPLACEMENTS: Array<[RegExp, string]> = [
  [/\bA\.I\.\b/gi, "A I"],
  [/\bAI\b/g, "A I"],
  [/\be\.g\.\b/gi, "for example"],
  [/\bi\.e\.\b/gi, "that is"],
  [/\betc\.\b/gi, "etcetera"],
  [/\bCEO\b/g, "C E O"],
  [/\bAPI\b/g, "A P I"],
  [/\bUI\b/g, "U I"],
  [/\bCRM\b/g, "C R M"],
  [/\bSaaS\b/g, "sass"],
];

export type PreparedSpeech = {
  text: string;
  /** Language used for voice selection and pacing */
  language: SpeechLanguage;
  detectedLanguage: SpeechLanguage;
};

/** Clean markdown and tune phrasing for natural Indian TTS. */
export function prepareSpeechText(rawText: string): PreparedSpeech {
  const detectedLanguage = detectSpeechLanguage(rawText);
  let text = cleanTextForSpeech(rawText);
  if (!text) {
    return { text: "", language: "english", detectedLanguage };
  }

  if (detectedLanguage === "english") {
    text = text.replace(/[\u{1F300}-\u{1FAFF}\u2600-\u27BF]/gu, " ");
    for (const [pattern, replacement] of PRONUNCIATION_REPLACEMENTS) {
      text = text.replace(pattern, replacement);
    }
    text = text.replace(/([.!?।])\s*([.!?।])+/g, "$1");
    text = text.replace(/\s{2,}/g, " ").trim();
    return { text, language: "english", detectedLanguage };
  }

  // Hindi / Hinglish — slower human pacing, no spoken symbols
  text = text.replace(/[\u{1F300}-\u{1FAFF}\u2600-\u27BF]/gu, " ");
  const humanized = humanizeIndianSpeech(text, detectedLanguage);
  text = humanized.text;
  text = text.replace(/([.!?।])\s*([.!?।])+/g, "$1");
  text = text.replace(/\s{2,}/g, " ").trim();

  const language = resolveTtsLanguage(detectedLanguage);

  return { text, language, detectedLanguage };
}
