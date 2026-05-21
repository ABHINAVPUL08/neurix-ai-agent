import { buildNeurixSystemPrompt } from "@/lib/consultant-prompt";

/** Neurix AI consultant system instructions (Groq) */
export const NEURIX_SYSTEM_PROMPT = buildNeurixSystemPrompt();

export const GROQ_MODEL = "llama-3.3-70b-versatile";

/** Slightly higher for varied, consultative phrasing while staying coherent */
export const GROQ_TEMPERATURE = 0.72;

export const GROQ_MAX_TOKENS = 1200;
