import OpenAI from "openai";
import { normalizeEnvValue } from "@/lib/env";
import { OPENAI_MODEL } from "@/lib/constants";

export const CHAT_AI_PROVIDER = "openai" as const;

function readOpenAiApiKey(): string {
  console.log("OPENAI KEY EXISTS:", !!process.env.OPENAI_API_KEY);

  const apiKey = normalizeEnvValue(process.env.OPENAI_API_KEY);
  if (!apiKey) {
    throw new Error(
      "OPENAI_API_KEY is not configured. Add it in Vercel (Production) and redeploy.",
    );
  }

  if (apiKey.startsWith("gsk_")) {
    throw new Error(
      "OPENAI_API_KEY looks like a Groq key (gsk_). Set a valid OpenAI key (sk-...) in Vercel.",
    );
  }

  if (!apiKey.startsWith("sk-")) {
    throw new Error(
      "OPENAI_API_KEY format is invalid. OpenAI keys start with sk-.",
    );
  }

  return apiKey;
}

/** Server-side OpenAI client for /api/chat only. */
export function createOpenAiClient(): OpenAI {
  const apiKey = readOpenAiApiKey();

  console.log("[chat] provider:", CHAT_AI_PROVIDER);
  console.log("[chat] selected model:", OPENAI_MODEL);
  console.log("[chat] OPENAI_API_KEY length:", apiKey.length);

  return new OpenAI({ apiKey });
}
