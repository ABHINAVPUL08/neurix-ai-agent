/** Local / non-Vercel max upload (under 10 MB) */
export const MAX_UPLOAD_BYTES = 9 * 1024 * 1024;

/** Vercel serverless request body limit (~4.5 MB) */
export const VERCEL_MAX_UPLOAD_BYTES = 4 * 1024 * 1024;

/** Effective upload cap based on deployment */
export function getMaxUploadBytes(): number {
  if (process.env.VERCEL === "1") {
    return VERCEL_MAX_UPLOAD_BYTES;
  }
  return MAX_UPLOAD_BYTES;
}

export function getMaxUploadLabel(): string {
  return process.env.VERCEL === "1" ? "4 MB" : "9 MB";
}

export const MAX_EXPORT_PAYLOAD_BYTES = 2 * 1024 * 1024;

export const MAX_CHAT_MESSAGES = 48;

export const MAX_CHAT_MESSAGE_CHARS = 12_000;

export function getGroqApiKey(): string {
  const apiKey = process.env.GROQ_API_KEY?.trim();
  if (!apiKey) {
    throw new Error(
      "GROQ_API_KEY is not configured. Add it in your Vercel project environment variables.",
    );
  }
  return apiKey;
}

export function getOpenAiApiKey(): string {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    const hint =
      process.env.NODE_ENV === "production" || process.env.VERCEL === "1"
        ? "Add it in your Vercel project environment variables."
        : "Add OPENAI_API_KEY to .env.local and restart the dev server.";
    throw new Error(`OPENAI_API_KEY is not configured. ${hint}`);
  }
  return apiKey;
}

export function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}
