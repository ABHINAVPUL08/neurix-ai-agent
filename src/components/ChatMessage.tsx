"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { Bot, User, Copy, Check, RotateCcw, ThumbsUp, ThumbsDown } from "lucide-react";
import { memo, useState } from "react";

const MessageMarkdown = dynamic(
  () =>
    import("@/components/chat/MessageMarkdown").then((m) => m.MessageMarkdown),
  {
    ssr: false,
    loading: () => (
      <div className="space-y-2 py-1">
        <div className="h-3 w-full animate-pulse rounded bg-purple-500/15" />
        <div className="h-3 w-4/5 animate-pulse rounded bg-purple-500/10" />
      </div>
    ),
  },
);

const DocumentAnalysisReport = dynamic(
  () =>
    import("@/components/chat/DocumentAnalysisReport").then(
      (m) => m.DocumentAnalysisReport,
    ),
  { ssr: false },
);
import { SpeechButton } from "@/components/SpeechButton";
import { isDocumentAnalysisReport } from "@/lib/parse-document-analysis";
import type { MessageFeedback, MessageKind, MessageRole } from "@/types/chat";

export type ChatMessageProps = {
  messageId: string;
  role: MessageRole;
  content: string;
  index: number;
  createdAt: number;
  isStreaming?: boolean;
  kind?: MessageKind;
  truncatedNote?: boolean;
  projectName?: string;
  sourceFilename?: string;
  feedback?: MessageFeedback;
  onFeedback?: (feedback: MessageFeedback) => void;
  onRegenerate?: () => void;
  canRegenerate?: boolean;
};

function formatTime(ts: number): string {
  return new Intl.DateTimeFormat("en", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(ts));
}

function chatMessagePropsEqual(
  prev: ChatMessageProps,
  next: ChatMessageProps,
): boolean {
  return (
    prev.messageId === next.messageId &&
    prev.role === next.role &&
    prev.content === next.content &&
    prev.isStreaming === next.isStreaming &&
    prev.feedback === next.feedback &&
    prev.canRegenerate === next.canRegenerate &&
    prev.truncatedNote === next.truncatedNote &&
    prev.projectName === next.projectName &&
    prev.sourceFilename === next.sourceFilename &&
    prev.kind === next.kind
  );
}

export const ChatMessage = memo(function ChatMessage({
  messageId,
  role,
  content,
  index,
  createdAt,
  isStreaming = false,
  kind,
  truncatedNote,
  projectName,
  sourceFilename,
  feedback,
  onFeedback,
  onRegenerate,
  canRegenerate,
}: ChatMessageProps) {
  const displayContent = content ?? "";
  const isUser = role === "user";
  const isDocReport =
    !isUser &&
    (kind === "document-analysis" ||
      isDocumentAnalysisReport(displayContent));
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(displayContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.38, delay: Math.min(index * 0.025, 0.15) }}
      className={`chat-message-row group flex w-full min-w-0 gap-2.5 sm:gap-4 ${isUser ? "flex-row-reverse" : ""}`}
    >
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ring-1 transition-all duration-300 group-hover:scale-[1.03] group-hover:shadow-[0_0_24px_rgba(168,85,247,0.28)] sm:h-11 sm:w-11 sm:rounded-2xl lg:h-12 lg:w-12 ${
          isUser
            ? "bg-zinc-800/90 ring-zinc-600/40"
            : "bg-gradient-to-br from-purple-600/55 to-violet-800/55 ring-purple-400/40"
        }`}
      >
        {isUser ? (
          <User className="h-5 w-5 text-zinc-300" />
        ) : (
          <Bot className="h-5 w-5 text-purple-200" />
        )}
      </div>

      <div
        className={`flex min-w-0 flex-1 flex-col overflow-hidden ${
          isUser
            ? "max-w-[min(92%,100%)] items-end sm:max-w-[78%]"
            : "w-full max-w-full items-start"
        }`}
      >
        <div
          className={`chat-message-bubble w-full min-w-0 overflow-hidden transition-all duration-300 ${
            isUser
              ? "rounded-2xl rounded-tr-lg bg-gradient-to-br from-purple-600 to-violet-700 px-3.5 py-3 text-white shadow-xl shadow-purple-900/40 sm:rounded-3xl sm:px-6 sm:py-5"
              : isDocReport
                ? "consultant-report-bubble rounded-2xl rounded-tl-lg px-3 py-4 sm:rounded-3xl sm:px-6 sm:py-6"
                : `ai-message-bubble rounded-2xl rounded-tl-lg px-3.5 py-3 sm:rounded-3xl sm:px-6 sm:py-5 ${
                    isStreaming ? "ai-message-streaming" : ""
                  }`
          }`}
        >
          {isUser ? (
            <p className="break-words text-[15px] leading-[1.65] [overflow-wrap:anywhere] sm:text-base sm:leading-[1.75] lg:text-[17px]">
              {displayContent}
            </p>
          ) : isDocReport ? (
            <DocumentAnalysisReport
              content={displayContent}
              isStreaming={isStreaming}
              truncatedNote={truncatedNote}
              projectName={projectName}
              sourceFilename={sourceFilename}
            />
          ) : (
            <div className="flex min-w-0 gap-2 sm:gap-3">
              <div className="min-w-0 flex-1 overflow-hidden">
                {displayContent.trim() || isStreaming ? (
                  <MessageMarkdown
                    key={`${messageId}-${displayContent.length}`}
                    content={displayContent || " "}
                    className="text-[15px] leading-[1.65] sm:text-base sm:leading-[1.75] lg:text-[17px]"
                  />
                ) : null}
                {isStreaming && (
                  <motion.span
                    className="stream-cursor ml-0.5 inline-block h-5 w-0.5 align-middle bg-purple-400"
                    animate={{ opacity: [1, 0.15, 1] }}
                    transition={{ duration: 0.75, repeat: Infinity }}
                    aria-hidden
                  />
                )}
              </div>
              {!isStreaming && displayContent.trim() && (
                <SpeechButton messageId={messageId} text={displayContent} />
              )}
            </div>
          )}
        </div>

        {!isStreaming && (
          <div
            className={`message-actions-row mt-2 flex max-w-full items-center gap-1.5 px-0.5 opacity-100 transition-all duration-200 sm:flex-wrap sm:gap-2 sm:px-1 sm:opacity-0 sm:group-hover:opacity-100 ${
              isUser ? "flex-row-reverse justify-end" : ""
            }`}
          >
            <span className="text-xs text-zinc-600">{formatTime(createdAt)}</span>
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-zinc-500 hover:bg-zinc-800/60 hover:text-zinc-300"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-green-400" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
              Copy
            </button>
            {!isUser && onFeedback && (
              <>
                <button
                  type="button"
                  onClick={() =>
                    onFeedback(feedback === "up" ? null : "up")
                  }
                  className={`rounded-lg p-1.5 ${
                    feedback === "up"
                      ? "text-green-400"
                      : "text-zinc-500 hover:text-green-400"
                  }`}
                  aria-label="Good response"
                >
                  <ThumbsUp className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    onFeedback(feedback === "down" ? null : "down")
                  }
                  className={`rounded-lg p-1.5 ${
                    feedback === "down"
                      ? "text-red-400"
                      : "text-zinc-500 hover:text-red-400"
                  }`}
                  aria-label="Poor response"
                >
                  <ThumbsDown className="h-3.5 w-3.5" />
                </button>
              </>
            )}
            {!isUser && canRegenerate && onRegenerate && (
              <button
                type="button"
                onClick={onRegenerate}
                className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-zinc-500 hover:text-purple-300"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Regenerate
              </button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}, chatMessagePropsEqual);
