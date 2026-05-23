/**
 * Read server env vars at runtime using dynamic keys.
 * Bracket access prevents Next.js from inlining undefined at build time
 * when the variable is added to Vercel after the first deploy.
 */
export function readServerEnv(name: string): string | undefined {
  const value = process.env[name];
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

export function readOpenAiApiKey(): string | undefined {
  return readServerEnv("OPENAI_API_KEY");
}

export function logOpenAiEnv(): void {
  const key = readOpenAiApiKey();
  console.log("OPENAI EXISTS:", !!key);
  console.log("OPENAI LENGTH:", key?.length ?? 0);
}
