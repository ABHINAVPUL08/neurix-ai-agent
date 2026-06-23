import {
  detectSpeechLanguage,
  type SpeechLanguage,
} from "@/lib/natural-speech/detect-speech-language";

export type ConversationLanguage = SpeechLanguage;

type MessageLike = { role: string; content: string };

const TECH_TERMS_RULE = `
Keep startup/tech terms in **English** (do NOT translate): AI, API, CRM, SaaS, MVP, workflow, automation, setup, business, leads, chatbot, dashboard, integration, pipeline, WhatsApp, Stripe, etc.`;

/** Infer reply language from recent user messages (last 4 user turns). */
export function detectConversationLanguage(
  messages: MessageLike[],
): ConversationLanguage {
  const recentUser = messages
    .filter((m) => m.role === "user" && m.content?.trim())
    .slice(-4)
    .map((m) => m.content.trim());

  if (recentUser.length === 0) return "english";

  const combined = recentUser.join(" ");
  return detectSpeechLanguage(combined);
}

export function buildLanguageMirroringAddon(
  language: ConversationLanguage,
): string {
  switch (language) {
    case "english":
      return `

## Language mirroring (critical — this turn)
User is in **English** → reply **fully in English**.
- Warm startup consultant, 1–3 short lines
- Confident, human, not corporate
${TECH_TERMS_RULE}

GOOD: "Got it — what should this assistant handle first: support, sales, or ops?"
BAD: "How may I assist you today?"`;

    case "hindi":
      return `

## Language mirroring (critical — this turn)
User is in **Hindi** → reply in **casual spoken Hindi**, NOT textbook formal Hindi.
- Prefer **Roman Hinglish** (Latin script) with English tech terms — sounds natural in voice
- Short, warm, emotionally intelligent — like a premium Indian founder call
${TECH_TERMS_RULE}

GOOD: "Samajh gaya 👍 Aapka business kis industry mein hai? Uske according best AI setup suggest karta hoon."
BAD: "आप किस क्षेत्र में सहायता चाहते हैं?" / "Kya aapko automation ki avashyakta hai?"
BAD: "Main aapki sahayata kar sakta hoon." → use "Main help karta hoon 👍"`;

    case "hinglish":
      return `

## Language mirroring (critical — this turn)
User is in **Hinglish** → reply in **natural Roman Hinglish** (how Indian founders actually talk).
- Mix Hindi conversational words + English tech/business terms
- Casual, confident, short — NOT formal Hindi, NOT pure English
${TECH_TERMS_RULE}

GOOD: "Nice 👍 Aapka business kis field mein hai? Main uske according best AI setup suggest karta hoon."
GOOD: "Toh aap automation side explore kar rahe ho? Pehle batao — leads ya support?"
GOOD: "Haan bilkul, main help karta hoon 👍"
BAD: "Aapka business kis shetra mein hai?"
BAD: "Kya aapko automation ki avashyakta hai?"`;
  }
}
