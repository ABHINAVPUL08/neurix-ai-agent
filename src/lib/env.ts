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

/** Strip whitespace and optional wrapping quotes from env values (common Vercel copy-paste issue). */
export function normalizeEnvValue(
  value: string | undefined,
): string | undefined {
  if (value == null) return undefined;
  let normalized = value.trim();
  if (
    (normalized.startsWith('"') && normalized.endsWith('"')) ||
    (normalized.startsWith("'") && normalized.endsWith("'"))
  ) {
    normalized = normalized.slice(1, -1).trim();
  }
  return normalized || undefined;
}

export type AiEnvDiagnostics = {
  openAiKeyConfigured: boolean;
  openAiKeyLength: number;
  groqKeyConfigured: boolean;
  nodeEnv: string | undefined;
  vercelEnv: string | undefined;
  vercel: boolean;
  runtime: "server";
};

/** Safe diagnostics for server logs / health checks — never exposes secret values. */
export function getOpenAiEnvDiagnostics(): AiEnvDiagnostics {
  const openAiKey = normalizeEnvValue(process.env.OPENAI_API_KEY);
  return {
    openAiKeyConfigured: Boolean(openAiKey),
    openAiKeyLength: openAiKey?.length ?? 0,
    groqKeyConfigured: Boolean(normalizeEnvValue(process.env.GROQ_API_KEY)),
    nodeEnv: process.env.NODE_ENV,
    vercelEnv: process.env.VERCEL_ENV,
    vercel: process.env.VERCEL === "1",
    runtime: "server",
  };
}

export function getGroqApiKey(): string {
  const apiKey = normalizeEnvValue(process.env.GROQ_API_KEY);
  if (!apiKey) {
    throw new Error(
      "GROQ_API_KEY is not configured. Add it in your Vercel project environment variables.",
    );
  }
  return apiKey;
}

export function getOpenAiApiKey(): string {
  const apiKey = normalizeEnvValue(process.env.OPENAI_API_KEY);
  if (!apiKey) {
    const onVercel =
      process.env.VERCEL === "1" || process.env.NODE_ENV === "production";
    const hint = onVercel
      ? "Add OPENAI_API_KEY in Vercel → Settings → Environment Variables (enable Production), then redeploy. Env changes are not applied until a new deployment completes."
      : "Add OPENAI_API_KEY to .env.local and restart the dev server.";
    throw new Error(`OPENAI_API_KEY is not configured. ${hint}`);
  }
  return apiKey;
}

export function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}
