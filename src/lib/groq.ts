import Groq from "groq-sdk";
import { getGroqApiKey } from "@/lib/env";

/** Server-side Groq client (API routes only) */
export function getGroqClient(): Groq {
  return new Groq({ apiKey: getGroqApiKey() });
}
