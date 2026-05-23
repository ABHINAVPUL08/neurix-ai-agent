import OpenAI from "openai";
import { getOpenAiApiKey, getOpenAiEnvDiagnostics } from "@/lib/env";
import { OPENAI_MODEL } from "@/lib/constants";

export const CHAT_AI_PROVIDER = "openai" as const;

/** Server-side OpenAI client (chat API route only). Reads process.env.OPENAI_API_KEY at call time. */
export function getOpenAiClient(): OpenAI {
  const diagnostics = getOpenAiEnvDiagnostics();
  console.log("[chat] provider:", CHAT_AI_PROVIDER);
  console.log("[chat] selected model:", OPENAI_MODEL);
  console.log("[chat] OPENAI_API_KEY exists:", diagnostics.openAiKeyConfigured);
  console.log("[chat] env diagnostics:", diagnostics);

  const apiKey = getOpenAiApiKey();
  return new OpenAI({ apiKey });
}
