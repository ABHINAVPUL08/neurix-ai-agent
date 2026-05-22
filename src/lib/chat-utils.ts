import type {
  ChatMessageItem,
  Conversation,
  MessageKind,
  MessageRole,
} from "@/types/chat";

export const WELCOME_ID = "welcome";

export function createMessage(
  role: MessageRole,
  content: string,
  options?: { kind?: MessageKind },
): ChatMessageItem {
  return {
    id: crypto.randomUUID(),
    role,
    content,
    createdAt: Date.now(),
    ...(options?.kind ? { kind: options.kind } : {}),
  };
}

export const WELCOME_MESSAGE: ChatMessageItem = {
  id: WELCOME_ID,
  role: "assistant",
  createdAt: Date.now(),
  content:
    "Welcome to Neurix AI. I help businesses design intelligent automation — AI agents, voice systems, OCR pipelines, and custom SaaS. What would you like to build?",
};

export function getChatTitle(messages: ChatMessageItem[]): string {
  const firstUser = messages.find((m) => m.role === "user");
  if (!firstUser) return "New conversation";
  return firstUser.content.slice(0, 42) + (firstUser.content.length > 42 ? "…" : "");
}

/** True if the user has sent at least one message (persistable chat). */
export function conversationHasUserContent(conv: Conversation): boolean {
  return conv.messages.some((m) => m.role === "user");
}
