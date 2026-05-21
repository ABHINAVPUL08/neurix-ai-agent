import { WELCOME_ID } from "@/lib/chat-utils";
import type { Conversation } from "@/types/chat";

const STORAGE_KEY = "neurix-conversations-v1";

export function loadConversations(): Conversation[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Conversation[];
  } catch {
    return [];
  }
}

export function saveConversations(conversations: Conversation[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
}

export function exportConversationMarkdown(
  conversation: Conversation,
): string {
  const lines = [
    `# Neurix Chat — ${conversation.title}`,
    `_Exported ${new Date().toLocaleString()}_`,
    "",
  ];
  for (const m of conversation.messages) {
    if (m.id === WELCOME_ID) continue;
    lines.push(`## ${m.role === "user" ? "You" : "Neurix"}`, "", m.content, "");
  }
  return lines.join("\n");
}
