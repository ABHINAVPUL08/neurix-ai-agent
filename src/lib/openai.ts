import OpenAI from "openai";
import { getOpenAiApiKey } from "@/lib/env";

/** Server-side OpenAI client (chat API route only) */
export function getOpenAiClient(): OpenAI {
  return new OpenAI({ apiKey: getOpenAiApiKey() });
}
