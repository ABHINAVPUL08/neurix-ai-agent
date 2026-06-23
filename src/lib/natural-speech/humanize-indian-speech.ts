import type { SpeechLanguage } from "@/lib/natural-speech/detect-speech-language";

/** Keep startup/tech terms in English for natural Indian founder speech */
const ENGLISH_TECH_TERMS =
  /\b(AI|API|CRM|SaaS|MVP|UI|UX|workflow|automation|setup|business|leads|chatbot|dashboard|integration|pipeline|OpenAI|WhatsApp|Stripe|HubSpot|Salesforce|n8n|Zapier)\b/gi;

const FORMAL_TO_CASUAL_ROMAN: Array<[RegExp, string]> = [
  [/Kya aapko/gi, "Toh aap"],
  [/kya aapko/gi, "toh aap"],
  [/Main aapki sahayata kar sakta hoon/gi, "Main help karta hoon"],
  [/main aapki sahayata kar sakta hoon/gi, "main help karta hoon"],
  [/aapki sahayata/gi, "help"],
  [/sahayata/gi, "help"],
  [/avashyakta hai/gi, "zarurat hai"],
  [/avashyakta/gi, "zarurat"],
  [/kis shetra mein/gi, "kis field mein"],
  [/kis kshetra mein/gi, "kis field mein"],
  [/shetra/gi, "field"],
  [/kshetra/gi, "field"],
  [/Aapka business kis field/gi, "Aapka business kis field"],
  [/automation ki avashyakta/gi, "automation explore kar rahe ho"],
  [/Aap customer support, lead generation, ya automation/gi, "Aap support, leads, ya automation"],
  [/main aapki madad kar sakta hoon/gi, "main help karta hoon"],
  [/kripya/gi, ""],
  [/kripya karke/gi, ""],
  [/dhanyavaad/gi, "thanks"],
  [/dhanyavad/gi, "thanks"],
];

const FORMAL_DEVANAGARI_TO_CASUAL: Array<[RegExp, string]> = [
  [/सहायता/g, "help"],
  [/आवश्यकता/g, "zarurat"],
  [/क्षेत्र/g, "field"],
  [/कृपया/g, ""],
  [/धन्यवाद/g, "thanks"],
  [/आपकी सहायता कर सकता हूँ/g, "help karta hoon"],
  [/आपकी सहायता/g, "help"],
  [/क्या आपको/g, "Toh aap"],
  [/किस क्षेत्र में/g, "kis field mein"],
  [/किस शेत्र में/g, "kis field mein"],
];

/** Common Devanagari → Roman for smoother en-IN TTS */
const DEVANAGARI_TO_ROMAN: Array<[RegExp, string]> = [
  [/समझ गया/g, "samajh gaya"],
  [/समझ गई/g, "samajh gayi"],
  [/समझ/g, "samajh"],
  [/पहले/g, "pehle"],
  [/बताइए/g, "batao"],
  [/बताओ/g, "batao"],
  [/आपका/g, "aapka"],
  [/आपके/g, "aapke"],
  [/आपको/g, "aapko"],
  [/मुझे/g, "mujhe"],
  [/हमारे/g, "hamare"],
  [/हमारा/g, "hamara"],
  [/बिज़नेस/g, "business"],
  [/बिजनेस/g, "business"],
  [/उसके/g, "uske"],
  [/उसी/g, "usi"],
  [/हिसाब/g, "hisaab"],
  [/सुझाता/g, "suggest karta"],
  [/सुझाती/g, "suggest karti"],
  [/चाहिए/g, "chahiye"],
  [/करना/g, "karna"],
  [/करने/g, "karne"],
  [/करते/g, "karte"],
  [/करता/g, "karta"],
  [/करती/g, "karti"],
  [/हैं/g, "hain"],
  [/है/g, "hai"],
  [/हूँ/g, "hoon"],
  [/हूं/g, "hoon"],
  [/नहीं/g, "nahi"],
  [/और/g, "aur"],
  [/लेकिन/g, "lekin"],
  [/अच्छा/g, "achha"],
  [/ठीक/g, "theek"],
  [/बिल्कुल/g, "bilkul"],
  [/ज़रूर/g, "zaroor"],
  [/जरूर/g, "zaroor"],
  [/क्या/g, "kya"],
  [/कौन/g, "kaun"],
  [/कैसे/g, "kaise"],
  [/कहाँ/g, "kahan"],
  [/कहां/g, "kahan"],
  [/अभी/g, "abhi"],
  [/फिर/g, "phir"],
  [/तो/g, "toh"],
  [/ही/g, "hi"],
  [/में/g, "mein"],
  [/से/g, "se"],
  [/को/g, "ko"],
  [/का/g, "ka"],
  [/की/g, "ki"],
  [/के/g, "ke"],
  [/यह/g, "yeh"],
  [/वह/g, "woh"],
  [/इस/g, "is"],
  [/उस/g, "us"],
  [/।/g, "."],
];

function hasDevanagari(text: string): boolean {
  return /[\u0900-\u097F]/.test(text);
}

function romanizeDevanagari(text: string): string {
  let out = text;
  for (const [pattern, replacement] of DEVANAGARI_TO_ROMAN) {
    out = out.replace(pattern, replacement);
  }
  return out.replace(/\s+/g, " ").trim();
}

function protectEnglishTerms(text: string): { text: string; slots: string[] } {
  const slots: string[] = [];
  const protectedText = text.replace(ENGLISH_TECH_TERMS, (match) => {
    const token = `§TECH${slots.length}§`;
    slots.push(match);
    return token;
  });
  return { text: protectedText, slots };
}

function restoreEnglishTerms(text: string, slots: string[]): string {
  let out = text;
  slots.forEach((term, i) => {
    out = out.replace(`§TECH${i}§`, term);
  });
  return out;
}

/**
 * Humanize Hindi/Hinglish text for speech — casual tone, Roman preferred, tech terms stay English.
 * Pauses are handled in speech-controller (not commas — TTS reads "comma" aloud).
 */
export function humanizeIndianSpeech(
  text: string,
  detected: SpeechLanguage,
): { text: string; speechLanguage: SpeechLanguage } {
  const { text: protectedText, slots } = protectEnglishTerms(text);
  let out = protectedText;

  for (const [pattern, replacement] of FORMAL_TO_CASUAL_ROMAN) {
    out = out.replace(pattern, replacement);
  }
  for (const [pattern, replacement] of FORMAL_DEVANAGARI_TO_CASUAL) {
    out = out.replace(pattern, replacement);
  }

  if (hasDevanagari(out) || detected === "hindi") {
    out = romanizeDevanagari(out);
  }

  out = restoreEnglishTerms(out, slots);
  out = out.replace(/\s{2,}/g, " ").trim();

  const speechLanguage: SpeechLanguage =
    detected === "english" ? "english" : "hinglish";

  return { text: out, speechLanguage };
}
