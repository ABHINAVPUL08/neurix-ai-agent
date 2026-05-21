/** Production-safe logging for document analysis (visible in Vercel function logs). */
export function logAnalyzeDocument(
  step: string,
  data?: Record<string, unknown>,
): void {
  if (data) {
    console.log(`[analyze-document] ${step}`, data);
  } else {
    console.log(`[analyze-document] ${step}`);
  }
}

export function logAnalyzeDocumentError(
  step: string,
  error: unknown,
  extra?: Record<string, unknown>,
): void {
  const message = error instanceof Error ? error.message : String(error);
  const stack =
    error instanceof Error ? error.stack?.split("\n").slice(0, 6).join("\n") : undefined;

  console.error(`[analyze-document] ${step}`, {
    message,
    stack,
    ...extra,
  });
}
