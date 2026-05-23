import { buildNeurixSystemPrompt } from "@/lib/consultant-prompt";

/** Neurix AI consultant system instructions */
export const NEURIX_SYSTEM_PROMPT = buildNeurixSystemPrompt();

export const OPENAI_MODEL = "gpt-4o-mini";

export const OPENAI_TEMPERATURE = 0.5;

export const OPENAI_MAX_TOKENS = 300;

export const GROQ_MODEL = "llama-3.3-70b-versatile";

/** Slightly higher for varied, consultative phrasing while staying coherent */
export const GROQ_TEMPERATURE = 0.72;
