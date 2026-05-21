/** Client-side smooth text reveal (e.g. for long document analysis) */
export async function revealTextSmoothly(
  fullText: string,
  onUpdate: (text: string) => void,
  options?: { chunkSize?: number; delayMs?: number; signal?: AbortSignal },
): Promise<void> {
  const chunkSize = options?.chunkSize ?? 4;
  const delayMs = options?.delayMs ?? 10;
  let revealed = "";

  for (let i = 0; i < fullText.length; i += chunkSize) {
    if (options?.signal?.aborted) return;
    revealed += fullText.slice(i, i + chunkSize);
    onUpdate(revealed);
    await new Promise((r) => setTimeout(r, delayMs));
    if (options?.signal?.aborted) return;
  }
}
