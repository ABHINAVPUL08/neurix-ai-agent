"use client";

import { useCallback, useEffect, useState } from "react";
import { resolveAiMode, type AiModeId } from "@/lib/ai-modes";
import {
  WELCOME_MESSAGE,
  WELCOME_ID,
  createMessage,
  getChatTitle,
} from "@/lib/chat-utils";
import {
  loadConversations,
  saveConversations,
} from "@/lib/storage/conversations";
import type {
  ChatMessageItem,
  Conversation,
  UploadedFileRecord,
} from "@/types/chat";

function createConversation(mode: AiModeId = "consultant"): Conversation {
  const now = Date.now();
  return {
    id: crypto.randomUUID(),
    title: "New conversation",
    messages: [WELCOME_MESSAGE],
    uploadedFiles: [],
    aiMode: mode,
    createdAt: now,
    updatedAt: now,
  };
}

export function useChatSessions(initialMode: AiModeId = "consultant") {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = loadConversations().map((c) => ({
      ...c,
      aiMode: resolveAiMode(c.aiMode),
    }));
    if (stored.length > 0) {
      setConversations(stored);
      setActiveId(stored[0].id);
    } else {
      const first = createConversation(initialMode);
      setConversations([first]);
      setActiveId(first.id);
    }
    setHydrated(true);
  }, [initialMode]);

  useEffect(() => {
    if (!hydrated || conversations.length === 0) return;
    saveConversations(conversations);
  }, [conversations, hydrated]);

  const active = conversations.find((c) => c.id === activeId) ?? conversations[0];

  const updateActive = useCallback(
    (
      updater: (conv: Conversation) => Conversation,
    ) => {
      if (!activeId) return;
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id !== activeId) return c;
          const next = updater(c);
          return {
            ...next,
            updatedAt: Date.now(),
            title: getChatTitle(next.messages),
          };
        }),
      );
    },
    [activeId],
  );

  const setMessages = useCallback(
    (messages: ChatMessageItem[] | ((prev: ChatMessageItem[]) => ChatMessageItem[])) => {
      updateActive((c) => ({
        ...c,
        messages:
          typeof messages === "function" ? messages(c.messages) : messages,
      }));
    },
    [updateActive],
  );

  const setUploadedFiles = useCallback(
    (
      files:
        | UploadedFileRecord[]
        | ((prev: UploadedFileRecord[]) => UploadedFileRecord[]),
    ) => {
      updateActive((c) => ({
        ...c,
        uploadedFiles:
          typeof files === "function" ? files(c.uploadedFiles) : files,
      }));
    },
    [updateActive],
  );

  const setAiMode = useCallback(
    (mode: AiModeId) => {
      updateActive((c) => ({ ...c, aiMode: mode }));
    },
    [updateActive],
  );

  const newChat = useCallback(() => {
    const conv = createConversation(active?.aiMode ?? initialMode);
    setConversations((prev) => [conv, ...prev]);
    setActiveId(conv.id);
    return conv.id;
  }, [active?.aiMode, initialMode]);

  const selectChat = useCallback((id: string) => {
    setActiveId(id);
  }, []);

  const deleteChat = useCallback(
    (id: string) => {
      setConversations((prev) => {
        const next = prev.filter((c) => c.id !== id);
        if (next.length === 0) {
          const fresh = createConversation(initialMode);
          setActiveId(fresh.id);
          return [fresh];
        }
        if (activeId === id) setActiveId(next[0].id);
        return next;
      });
    },
    [activeId, initialMode],
  );

  const setMessageFeedback = useCallback(
    (messageId: string, feedback: "up" | "down" | null) => {
      updateActive((c) => ({
        ...c,
        messages: c.messages.map((m) =>
          m.id === messageId ? { ...m, feedback } : m,
        ),
      }));
    },
    [updateActive],
  );

  return {
    hydrated,
    conversations,
    active,
    activeId,
    messages: active?.messages ?? [WELCOME_MESSAGE],
    uploadedFiles: active?.uploadedFiles ?? [],
    aiMode: resolveAiMode(active?.aiMode ?? initialMode),
    setMessages,
    setUploadedFiles,
    setAiMode,
    newChat,
    selectChat,
    deleteChat,
    setMessageFeedback,
    createMessage,
    WELCOME_ID,
  };
}
