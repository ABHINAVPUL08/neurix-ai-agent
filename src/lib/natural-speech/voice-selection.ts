import type { SpeechLanguage } from "@/lib/natural-speech/detect-speech-language";

const ENGLISH_PRIORITY: RegExp[] = [
  /microsoft.*aria/i,
  /^aria\b/i,
  /microsoft.*jenny/i,
  /google.*uk.*english.*female/i,
  /google.*us.*english/i,
];

/** Indian English / Hinglish — Neerja sounds most natural for Roman Hinglish */
const HINGLISH_PRIORITY: RegExp[] = [
  /microsoft.*neerja.*online/i,
  /neerja.*online/i,
  /microsoft.*neerja/i,
  /google.*english.*india/i,
  /india.*english/i,
  /en-in/i,
  /microsoft.*aria.*online/i,
  /microsoft.*aria/i,
];

const HINDI_FALLBACK_PRIORITY: RegExp[] = [
  /microsoft.*swara/i,
  /google.*hindi/i,
  /hindi.*india/i,
];

const ROBOTIC_VOICE_PATTERN =
  /compact|espeak|bad news|bells|boing|fred|junior|bahh|whisper|cellos|trinoids|albert|bruce|flo|sandy|reed|rocko|shelley|grandma|grandpa|zarvox|ralph|agnes|vicki|victoria|superstar|wobble|bubbles|deranged|good news|pipe organ|lekha|veena|heera/i;

const PREMIUM_HINT =
  /natural|neural|premium|enhanced|online|wavenet|studio|swara|neerja|neural2/i;

function normalizeName(name: string): string {
  return name.toLowerCase().replace(/\s+/g, " ").trim();
}

function matchesPriority(name: string, patterns: RegExp[]): number {
  for (let i = 0; i < patterns.length; i++) {
    if (patterns[i].test(name)) return 120 - i * 8;
  }
  return 0;
}

function scoreVoice(
  voice: SpeechSynthesisVoice,
  language: SpeechLanguage,
): number {
  const name = normalizeName(voice.name);
  const lang = voice.lang.toLowerCase();
  if (ROBOTIC_VOICE_PATTERN.test(name)) return -1000;

  let score = 0;
  if (PREMIUM_HINT.test(name)) score += 22;
  if (!voice.localService) score += 6;

  if (language === "hinglish" || language === "hindi") {
    if (lang === "en-in") score += 50;
    if (lang.startsWith("en")) score += 18;
    score += matchesPriority(name, HINGLISH_PRIORITY);
    if (/neerja|india|aria|jenny/i.test(name)) score += 20;
    if (lang.startsWith("hi") && language === "hindi") {
      score += matchesPriority(name, HINDI_FALLBACK_PRIORITY);
      score += 8;
    }
    if (/lekha|veena|heera|lekha/i.test(name)) score -= 15;
  } else {
    if (lang.startsWith("en")) score += 20;
    if (lang === "en-us" || lang === "en-gb") score += 8;
    score += matchesPriority(name, ENGLISH_PRIORITY);
  }

  return score;
}

export function pickNaturalVoice(
  voices: SpeechSynthesisVoice[],
  language: SpeechLanguage = "hinglish",
): SpeechSynthesisVoice | undefined {
  if (voices.length === 0) return undefined;

  const ttsLanguage = language === "hindi" ? "hinglish" : language;

  const pool = voices.filter((v) => {
    const lang = v.lang.toLowerCase();
    if (ttsLanguage === "hinglish") {
      return lang === "en-in" || lang.startsWith("en");
    }
    return lang.startsWith("en");
  });

  const candidates = pool.length > 0 ? pool : voices;
  const ranked = [...candidates].sort(
    (a, b) => scoreVoice(b, ttsLanguage) - scoreVoice(a, ttsLanguage),
  );

  const best = ranked[0];
  if (!best || scoreVoice(best, ttsLanguage) < 0) {
    return (
      voices.find((v) => v.lang === "en-IN") ??
      voices.find((v) => v.lang === "en-US") ??
      voices[0]
    );
  }
  return best;
}
