export type SpeechLanguage = "english" | "hindi" | "hinglish";

const DEVANAGARI = /[\u0900-\u097F]/;
const HINGLISH_ROMAN =
  /\b(aap|apka|apke|hai|hain|ho|kya|kyu|kyun|ke|ki|ko|mein|main|mera|mere|mujhe|tumhe|nahi|nahin|acha|achha|theek|thik|batao|bataiye|samajh|samjha|kaise|karna|karo|banana|banane|karne|automate|zyada|pehle|haan|han|ji|lekin|aur|toh|bhi|jab|tab|agar|par|sir|madam|shukriya|dhanyavad|chahiye|chahiye|business|industry)\b/gi;

export function detectSpeechLanguage(text: string): SpeechLanguage {
  const sample = text.trim();
  if (!sample) return "english";

  const letters = sample.replace(/\s+/g, "");
  if (!letters.length) return "english";

  const devanagariCount = (sample.match(new RegExp(DEVANAGARI.source, "g")) ?? [])
    .length;
  const devanagariRatio = devanagariCount / letters.length;

  if (devanagariRatio >= 0.28) return "hindi";

  const hinglishHits = (sample.match(HINGLISH_ROMAN) ?? []).length;
  const latinLetters = (sample.match(/[a-z]/gi) ?? []).length;

  if (devanagariRatio >= 0.06 && latinLetters > 0) return "hinglish";
  if (hinglishHits >= 1 && latinLetters > 0) return "hinglish";
  if (devanagariRatio > 0) return "hinglish";

  return "english";
}

export function recognitionLangForLanguage(lang: SpeechLanguage): string {
  switch (lang) {
    case "hindi":
      return "hi-IN";
    case "hinglish":
      return "en-IN";
    default:
      return "en-IN";
  }
}
