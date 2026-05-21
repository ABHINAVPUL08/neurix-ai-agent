/** Safe for Vercel serverless (~4.5 MB request body limit) */
export const VERCEL_MAX_UPLOAD_BYTES = 4 * 1024 * 1024;

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

export function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}
