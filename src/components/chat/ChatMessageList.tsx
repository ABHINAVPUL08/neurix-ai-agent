"use client";

import { memo } from "react";
import { ChatMessage } from "@/components/ChatMessage";
import type { ChatMessageItem } from "@/types/chat";

export type ChatMessageListProps = {
  messages: ChatMessageItem[];
  streamingId: string | null;
  lastAssistantIndex: number;
  docTruncated: boolean;
  auditProjectName: string;
  lastAuditFilename?: string;
  onFeedback: (messageId: string, feedback: "up" | "down" | null) => void;
  onRegenerate: () => void;
};

function ChatMessageListInner({
  messages,
  streamingId,
  lastAssistantIndex,
  docTruncated,
  auditProjectName,
  lastAuditFilename,
  onFeedback,
  onRegenerate,
}: ChatMessageListProps) {
  return (
    <div className="chat-messages-list content-shell min-w-0 space-y-6 py-4 sm:space-y-10 sm:py-8">
      {messages.map((msg, i) => (
        <ChatMessage
          key={msg.id}
          role={msg.role}
          content={msg.content}
          index={i}
          createdAt={msg.createdAt}
          kind={msg.kind}
          truncatedNote={msg.kind === "document-analysis" && docTruncated}
          projectName={auditProjectName}
          sourceFilename={lastAuditFilename}
          isStreaming={msg.id === streamingId}
          feedback={msg.feedback}
          onFeedback={(fb) => onFeedback(msg.id, fb)}
          canRegenerate={
            i === lastAssistantIndex &&
            msg.role === "assistant" &&
            msg.id !== streamingId
          }
          onRegenerate={i === lastAssistantIndex ? onRegenerate : undefined}
        />
      ))}
    </div>
  );
}

export const ChatMessageList = memo(ChatMessageListInner);
