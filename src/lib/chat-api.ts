import type { AiModeId } from "@/lib/ai-modes";
import { sanitizeChatMessages } from "@/lib/api/limits";
import type { ChatMessageItem } from "@/types/chat";

function buildChatPayload(
  messages: ChatMessageItem[],
  mode: AiModeId,
  welcomeId: string,
  stream: boolean,
) {
  const apiMessages = sanitizeChatMessages(
    messages
      .filter((m) => m.id !== welcomeId)
      .map(({ role, content }) => ({ role, content })),
  );

  console.log("[chat-api] outgoing messages:", apiMessages);
  console.log("[chat-api] mode:", mode);

  return {
    mode,
    stream,
    messages: apiMessages,
  };
}

function assertValidChatPayload(messages: { role: string; content: string }[]) {
  if (messages.length === 0) {
    throw new Error("No valid messages to send. Please enter a message.");
  }
  for (const m of messages) {
    if (
      (m.role !== "user" && m.role !== "assistant") ||
      typeof m.content !== "string" ||
      !m.content.trim()
    ) {
      throw new Error(
        "Each message must have role (user|assistant) and non-empty content",
      );
    }
  }
}

export async function fetchChatReply(
  messages: ChatMessageItem[],
  mode: AiModeId,
  welcomeId: string,
  signal?: AbortSignal,
): Promise<string> {
  const payload = buildChatPayload(messages, mode, welcomeId, false);
  assertValidChatPayload(payload.messages);

  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal,
  });

  const data = (await res.json()) as { message?: string; error?: string };
  if (!res.ok) {
    console.error("[chat-api] API response error:", data);
    throw new Error(data.error ?? "Failed to get AI response");
  }
  const reply = typeof data.message === "string" ? data.message.trim() : "";
  if (!reply) {
    throw new Error("Empty response from AI");
  }
  return reply;
}

export type StreamChatOptions = {
  onChunk: (text: string) => void;
  onDone: () => void;
  onError: (error: Error) => void;
  signal?: AbortSignal;
};

/** Stream OpenAI response via SSE with optional abort */
export async function fetchChatReplyStream(
  messages: ChatMessageItem[],
  mode: AiModeId,
  welcomeId: string,
  { onChunk, onDone, onError, signal }: StreamChatOptions,
): Promise<void> {
  try {
    const payload = buildChatPayload(messages, mode, welcomeId, true);
    assertValidChatPayload(payload.messages);

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal,
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      console.error("[chat-api] API response error:", data);
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
