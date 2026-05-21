import {
  MAX_CHAT_MESSAGE_CHARS,
  MAX_CHAT_MESSAGES,
  MAX_EXPORT_PAYLOAD_BYTES,
} from "@/lib/env";

export type ChatMessagePayload = {
  role: "user" | "assistant";
  content: string;
};

export function validateChatMessages(
  messages: ChatMessagePayload[] | undefined,
): string | null {
  if (!Array.isArray(messages) || messages.length === 0) {
    return "Messages array is required";
  }

  if (messages.length > MAX_CHAT_MESSAGES) {
    return `Too many messages. Maximum is ${MAX_CHAT_MESSAGES}.`;
  }

  for (const m of messages) {
    if (
      !m ||
      (m.role !== "user" && m.role !== "assistant") ||
      typeof m.content !== "string" ||
      !m.content.trim()
    ) {
      return "Each message must have role (user|assistant) and non-empty content";
    }
    if (m.content.length > MAX_CHAT_MESSAGE_CHARS) {
      return `Message too long. Maximum is ${MAX_CHAT_MESSAGE_CHARS} characters.`;
    }
  }

  return null;
}

export function validateJsonBodySize(
  rawBody: string,
  maxBytes: number,
): string | null {
  const size = new TextEncoder().encode(rawBody).length;
  if (size > maxBytes) {
    return `Request body too large. Maximum is ${Math.round(maxBytes / (1024 * 1024))} MB.`;
  }
  return null;
}

export { MAX_EXPORT_PAYLOAD_BYTES };
