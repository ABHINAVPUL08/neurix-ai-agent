import type { AiModeId } from "@/lib/ai-modes";
import type { ChatMessageItem } from "@/types/chat";

function buildChatPayload(
  messages: ChatMessageItem[],
  mode: AiModeId,
  welcomeId: string,
  stream: boolean,
) {
  return {
    mode,
    stream,
    messages: messages
      .filter((m) => m.id !== welcomeId)
      .map(({ role, content }) => ({ role, content })),
  };
}

export async function fetchChatReply(
  messages: ChatMessageItem[],
  mode: AiModeId,
  welcomeId: string,
  signal?: AbortSignal,
): Promise<string> {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(buildChatPayload(messages, mode, welcomeId, false)),
    signal,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Failed to get AI response");
  return data.message as string;
}

export type StreamChatOptions = {
  onChunk: (text: string) => void;
  onDone: () => void;
  onError: (error: Error) => void;
  signal?: AbortSignal;
};

/** Stream Groq response via SSE with optional abort */
export async function fetchChatReplyStream(
  messages: ChatMessageItem[],
  mode: AiModeId,
  welcomeId: string,
  { onChunk, onDone, onError, signal }: StreamChatOptions,
): Promise<void> {
  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(buildChatPayload(messages, mode, welcomeId, true)),
      signal,
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(
        (data as { error?: string }).error ?? "Failed to get AI response",
      );
    }

    const reader = res.body?.getReader();
    if (!reader) throw new Error("No response stream");

    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      if (signal?.aborted) {
        await reader.cancel();
        throw new DOMException("Aborted", "AbortError");
      }

      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        const payload = line.slice(6).trim();
        if (payload === "[DONE]") {
          onDone();
          return;
        }
        try {
          const parsed = JSON.parse(payload) as {
            text?: string;
            error?: string;
          };
          if (parsed.error) throw new Error(parsed.error);
          if (parsed.text) onChunk(parsed.text);
        } catch (e) {
          if (e instanceof SyntaxError) continue;
          throw e;
        }
      }
    }
    onDone();
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      onDone();
      return;
    }
    onError(err instanceof Error ? err : new Error("Stream failed"));
  }
}
