"use client";

import dynamic from "next/dynamic";
import { AnimatePresence } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BackgroundEffects } from "@/components/effects/BackgroundEffects";
import { ChatMessageList } from "@/components/chat/ChatMessageList";
import { ChatShellSkeleton } from "@/components/chat/ChatShellSkeleton";
import { conversationHasUserContent } from "@/lib/chat-utils";
import { Navbar } from "@/components/Navbar";
import { TypingLoader } from "@/components/TypingLoader";
import { ChatComposer } from "@/components/chat/ChatComposer";
import { Sidebar } from "@/components/layout/Sidebar";
import { createBatchedContentUpdater } from "@/lib/batched-message-update";
import { useUploadProgress } from "@/hooks/useUploadProgress";
import { ExportToast, type ExportToastState } from "@/components/ui/ExportToast";
import {
  AuditExportProvider,
  useAuditExport,
} from "@/contexts/AuditExportContext";
import type { AnalysisMeta } from "@/hooks/useDocumentAnalysis";
import { useChatSessions } from "@/hooks/useChatSessions";
import { analyzeDocumentFile } from "@/lib/analyze-document-client";
import {
  fetchChatReply,
  fetchChatReplyStream,
  type ChatAttachmentPayload,
} from "@/lib/chat-api";
import { fileToDataUrl, isImageFile } from "@/lib/file-to-data-url";
import { revealTextSmoothly } from "@/lib/reveal-text";
import {
  getFeatureTile,
  type FeatureTileId,
} from "@/lib/feature-tiles";
import { openDocumentPicker } from "@/lib/open-document-picker";
import { validateDocumentFile } from "@/lib/validate-document-file";
import {
  exportConversationMarkdown,
} from "@/lib/storage/conversations";
import { speechController } from "@/lib/speech-controller";
import type { AppView, ChatMessageItem } from "@/types/chat";

const DashboardView = dynamic(
  () =>
    import("@/components/dashboard/DashboardView").then((m) => m.DashboardView),
  { ssr: false },
);

const ChatHero = dynamic(
  () => import("@/components/hero/ChatHero").then((m) => m.ChatHero),
  { ssr: false },
);

const TemplateMarketplace = dynamic(
  () =>
    import("@/components/templates/TemplateMarketplace").then(
      (m) => m.TemplateMarketplace,
    ),
  { ssr: false },
);

const ConsultationModal = dynamic(
  () =>
    import("@/components/modals/ConsultationModal").then(
      (m) => m.ConsultationModal,
    ),
  { ssr: false },
);

const PricingModal = dynamic(
  () =>
    import("@/components/pricing/PricingModal").then((m) => m.PricingModal),
  { ssr: false },
);

export function NeurixPlatform() {
  const [exportToast, setExportToast] = useState<ExportToastState>(null);

  useEffect(() => {
    if (!exportToast) return;
    const t = window.setTimeout(() => setExportToast(null), 5500);
    return () => window.clearTimeout(t);
  }, [exportToast]);

  return (
    <AuditExportProvider onToast={setExportToast}>
      <NeurixPlatformInner onToast={setExportToast} />
      <ExportToast toast={exportToast} onDismiss={() => setExportToast(null)} />
    </AuditExportProvider>
  );
}

function NeurixPlatformInner({
  onToast,
}: {
  onToast: (toast: ExportToastState) => void;
}) {
  const { exportReport, isExporting } = useAuditExport();
  const sessions = useChatSessions();
  const {
    hydrated,
    conversations,
    active,
    activeId,
    messages,
    aiMode,
    setMessages,
    setUploadedFiles,
    setAiMode,
    newChat,
    selectChat,
    deleteChat,
    setMessageFeedback,
    createMessage,
    WELCOME_ID,
  } = sessions;

  const [input, setInput] = useState("");
  const [view, setView] = useState<AppView>("chat");
  const [isLoading, setIsLoading] = useState(false);
  const [streamingId, setStreamingId] = useState<string | null>(null);
  const [isAnalyzingDoc, setIsAnalyzingDoc] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [consultationOpen, setConsultationOpen] = useState(false);
  const [pricingOpen, setPricingOpen] = useState(false);
  const [pendingAttachment, setPendingAttachment] = useState<File | null>(null);
  const [attachmentJustAdded, setAttachmentJustAdded] = useState(false);
  const [docTruncated, setDocTruncated] = useState(false);
  const [lastAuditFilename, setLastAuditFilename] = useState<string | undefined>();
  const [showTemplates, setShowTemplates] = useState(false);
  const [activeSuggestionLabels, setActiveSuggestionLabels] = useState<
    string[] | undefined
  >(undefined);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const composerInputRef = useRef<HTMLTextAreaElement>(null);
  const scrollThrottleRef = useRef(0);
  const abortRef = useRef<AbortController | null>(null);
  const sendInFlightRef = useRef(false);
  const {
    progress: uploadProgress,
    start: startUploadProgress,
    reset: resetUploadProgress,
    complete: completeUploadProgress,
  } = useUploadProgress();

  const showHero =
    view === "chat" &&
    messages.length === 1 &&
    messages[0]?.id === WELCOME_ID;
  const isGenerating =
    isLoading || isAnalyzingDoc || !!streamingId;
  const chatDisabled = isGenerating;
  const canSubmit =
    (!!input.trim() || !!pendingAttachment) && !chatDisabled;
  const lastAssistantIndex = useMemo(
    () => messages.findLastIndex((m) => m.role === "assistant"),
    [messages],
  );

  const scrollContentKey = useMemo(() => {
    const last = messages[messages.length - 1];
    return last ? `${last.id}:${last.content.length}` : "0";
  }, [messages]);

  const auditMessage = useMemo(
    () =>
      [...messages]
        .reverse()
        .find(
          (m) =>
            m.kind === "document-analysis" &&
            m.content.trim().length > 80,
        ),
    [messages],
  );

  const auditProjectName = useMemo(() => {
    if (lastAuditFilename) {
      return lastAuditFilename
        .replace(/\.(pdf|docx|txt)$/i, "")
        .replace(/[-_]/g, " ")
        .trim();
    }
    return active?.title ?? "Business Project";
  }, [lastAuditFilename, active?.title]);

  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  useEffect(() => {
    const now = Date.now();
    if (streamingId && now - scrollThrottleRef.current < 120) return;
    const scrollEl = chatScrollRef.current;
    if (scrollEl) {
      const distanceFromBottom =
        scrollEl.scrollHeight - scrollEl.scrollTop - scrollEl.clientHeight;
      if (distanceFromBottom > 220) return;
    }
    scrollThrottleRef.current = now;
    chatEndRef.current?.scrollIntoView({
      behavior: streamingId ? "auto" : "smooth",
      block: "end",
    });
  }, [scrollContentKey, isLoading, isAnalyzingDoc, streamingId, view]);

  useEffect(() => () => speechController.stop(), []);

  const stopGeneration = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setStreamingId(null);
    setIsLoading(false);
    setIsAnalyzingDoc(false);
    resetUploadProgress();
    sendInFlightRef.current = false;
    setMessages((prev) => {
      const last = prev[prev.length - 1];
      if (last?.role === "assistant" && !last.content.trim()) {
        return prev.slice(0, -1);
      }
      return prev;
    });
  }, [resetUploadProgress, setMessages]);

  const streamAssistantReply = useCallback(
    async (
      history: ChatMessageItem[],
      attachment?: ChatAttachmentPayload,
    ) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      const assistantMsg = createMessage("assistant", "");
      const assistantId = assistantMsg.id;
      let streamedContent = "";

      const applyAssistantContent = (content: string) => {
        streamedContent = content;
        setMessages((prev) => {
          const hasAssistant = prev.some((m) => m.id === assistantId);
          if (!hasAssistant) {
            return [...prev, { ...assistantMsg, content }];
          }
          return prev.map((m) =>
            m.id === assistantId ? { ...m, content } : m,
          );
        });
      };

      setMessages((prev) => [...prev, assistantMsg]);
      setStreamingId(assistantId);
      setIsLoading(false);

      const { push: appendChunk, flushNow: flushStreamChunks } =
        createBatchedContentUpdater((delta) => {
          applyAssistantContent(streamedContent + delta);
        });

      await new Promise<void>((resolve, reject) => {
        fetchChatReplyStream(history, aiMode, WELCOME_ID, {
          signal: controller.signal,
          attachment,
          onChunk: appendChunk,
          onDone: () => resolve(),
          onError: (err) => {
            if (err.name === "AbortError") resolve();
            else reject(err);
          },
        });
      });

      flushStreamChunks();

      if (!streamedContent.trim() && !controller.signal.aborted) {
        const reply = await fetchChatReply(
          history,
          aiMode,
          WELCOME_ID,
          controller.signal,
          attachment,
        );
        applyAssistantContent(reply);
      }

      setStreamingId(null);
      abortRef.current = null;
    },
    [aiMode, createMessage, setMessages, WELCOME_ID],
  );

  const revealDocumentAnalysis = useCallback(
    async (
      analysis: string,
      meta: AnalysisMeta,
      signal?: AbortSignal,
    ) => {
      setLastAuditFilename(meta.filename);
      setUploadedFiles((prev) => [
        {
          id: crypto.randomUUID(),
          name: meta.filename,
          analyzedAt: Date.now(),
          analysisPreview: analysis.slice(0, 120),
        },
        ...prev,
      ]);

      const assistantMsg = createMessage("assistant", "", {
        kind: "document-analysis",
      });

      setMessages((prev) => [...prev, assistantMsg]);
      setStreamingId(assistantMsg.id);
      setIsLoading(false);

      await revealTextSmoothly(
        analysis,
        (text) => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMsg.id ? { ...m, content: text } : m,
            ),
          );
        },
        { signal, chunkSize: 8, delayMs: 8 },
      );

      if (!signal?.aborted) setStreamingId(null);
    },
    [createMessage, setMessages, setUploadedFiles],
  );

  const handleFileSelected = useCallback((file: File) => {
    const validationError = validateDocumentFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    setPendingAttachment(file);
    setAttachmentJustAdded(true);
    window.setTimeout(() => setAttachmentJustAdded(false), 1800);
  }, []);

  const focusComposerInput = useCallback(() => {
    requestAnimationFrame(() => {
      window.setTimeout(() => {
        const el = composerInputRef.current;
        if (!el) return;
        el.focus();
        const len = el.value.length;
        el.setSelectionRange(len, len);
      }, 80);
    });
  }, []);

  const handlePasteLink = useCallback(() => {
    if (chatDisabled) return;
    const url = window.prompt("Paste a website link for Neurix to analyze:");
    if (!url?.trim()) return;
    setInput(
      `Analyze this website/business and give growth suggestions, UI/UX improvements, automation ideas, and business advice: ${url.trim()}`,
    );
    setView("chat");
    setShowTemplates(false);
    setError(null);
    focusComposerInput();
  }, [chatDisabled, focusComposerInput]);

  const handleFeatureTileSelect = useCallback(
    (tileId: FeatureTileId) => {
      if (chatDisabled) return;
      const tile = getFeatureTile(tileId);
      setView("chat");
      setShowTemplates(false);
      setAiMode(tile.aiModeId);
      setInput(tile.starterPrompt);
      setActiveSuggestionLabels(tile.suggestions);
      setError(null);
      if (tile.openUploadOnClick) {
        openDocumentPicker(handleFileSelected);
      }
      focusComposerInput();
    },
    [chatDisabled, setAiMode, focusComposerInput, handleFileSelected],
  );

  const sendMessage = useCallback(
    async (text?: string) => {
      const trimmed = (text ?? input).trim();
      const file = pendingAttachment;
      if ((!trimmed && !file) || chatDisabled || sendInFlightRef.current) return;

      sendInFlightRef.current = true;

      try {
        setView("chat");
        setShowTemplates(false);
        setError(null);

        if (file) {
          const fileToSend = file;
          setPendingAttachment(null);
          setAttachmentJustAdded(false);
          setInput("");

          if (isImageFile(fileToSend)) {
            const userNote = trimmed
              ? `${trimmed}\n\n🖼️ **Image attached:** ${fileToSend.name}`
              : `🖼️ **Image uploaded:** ${fileToSend.name}\n\nPlease analyze this image and give practical feedback.`;
            const userMessage = createMessage("user", userNote);
            const nextMessages = [...messages, userMessage];

            setMessages(nextMessages);
            setIsLoading(true);

            try {
              const dataUrl = await fileToDataUrl(fileToSend);
              await streamAssistantReply(nextMessages, {
                kind: "image",
                name: fileToSend.name,
                mimeType: fileToSend.type || "image/png",
                dataUrl,
              });
            } catch (err) {
              if (err instanceof Error && err.name === "AbortError") return;
              setStreamingId(null);
              setError(
                err instanceof Error
                  ? err.message
                  : "Image analysis failed.",
              );
            } finally {
              setIsLoading(false);
            }
            return;
          }

          const userNote = trimmed
            ? `${trimmed}\n\n📄 **Attached:** ${fileToSend.name}`
            : `📄 **Project document uploaded:** ${fileToSend.name}\n\nPlease review my business/project document and provide your structured analysis.`;

          setMessages((prev) => [...prev, createMessage("user", userNote)]);
          setIsAnalyzingDoc(true);
          setIsLoading(true);
          startUploadProgress();

          abortRef.current?.abort();
          const controller = new AbortController();
          abortRef.current = controller;

          try {
            const { analysis, meta } = await analyzeDocumentFile(
              fileToSend,
              controller.signal,
            );
            completeUploadProgress();
            setIsAnalyzingDoc(false);
            setDocTruncated(meta.truncated);
            await revealDocumentAnalysis(analysis, meta, controller.signal);
          } catch (err) {
            if (err instanceof Error && err.name === "AbortError") return;
            setError(
              err instanceof Error
                ? err.message
                : "Document analysis failed.",
            );
          } finally {
            setIsAnalyzingDoc(false);
            setIsLoading(false);
            setStreamingId(null);
            abortRef.current = null;
            resetUploadProgress();
          }
          return;
        }

        const userMessage = createMessage("user", trimmed);
        const nextMessages = [...messages, userMessage];

        setMessages(nextMessages);
        setInput("");
        setIsLoading(true);

        try {
          await streamAssistantReply(nextMessages);
        } catch (err) {
          if (err instanceof Error && err.name === "AbortError") return;
          setStreamingId(null);
          try {
            const reply = await fetchChatReply(
              nextMessages,
              aiMode,
              WELCOME_ID,
              abortRef.current?.signal,
            );
            if (!reply?.trim()) {
              throw new Error("Empty response from AI");
            }
            setMessages((prev) => {
              const last = prev[prev.length - 1];
              if (last?.role === "assistant") {
                return prev.map((m, i) =>
                  i === prev.length - 1 ? { ...m, content: reply } : m,
                );
              }
              return [...prev, createMessage("assistant", reply)];
            });
          } catch {
            setError(
              err instanceof Error
                ? err.message
                : "Something went wrong. Try again.",
            );
          }
        } finally {
          setIsLoading(false);
        }
      } finally {
        sendInFlightRef.current = false;
      }
    },
    [
      input,
      pendingAttachment,
      chatDisabled,
      messages,
      streamAssistantReply,
      revealDocumentAnalysis,
      aiMode,
      createMessage,
      setMessages,
      WELCOME_ID,
      startUploadProgress,
      completeUploadProgress,
      resetUploadProgress,
    ],
  );

  const handleRegenerate = useCallback(async () => {
    if (chatDisabled || lastAssistantIndex < 0 || sendInFlightRef.current) {
      return;
    }
    sendInFlightRef.current = true;
    const withoutLast = messages.slice(0, lastAssistantIndex);
    setMessages(withoutLast);
    setError(null);
    setIsLoading(true);
    try {
      await streamAssistantReply(withoutLast);
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
      setStreamingId(null);
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        return last?.role === "assistant" && !last.content.trim()
          ? prev.slice(0, -1)
          : prev;
      });
      setError(
        err instanceof Error ? err.message : "Regeneration failed.",
      );
    } finally {
      setIsLoading(false);
      sendInFlightRef.current = false;
    }
  }, [
    chatDisabled,
    lastAssistantIndex,
    messages,
    streamAssistantReply,
    setMessages,
  ]);

  const handleEditUserMessage = useCallback(
    async (messageId: string, currentContent: string) => {
      if (chatDisabled || sendInFlightRef.current) return;
      const edited = window.prompt("Edit your message", currentContent);
      const nextContent = edited?.trim();
      if (!nextContent || nextContent === currentContent.trim()) return;

      const userIndex = messages.findIndex((m) => m.id === messageId);
      if (userIndex < 0) return;

      sendInFlightRef.current = true;
      const editedHistory = messages.slice(0, userIndex + 1).map((message) =>
        message.id === messageId
          ? { ...message, content: nextContent, createdAt: Date.now() }
          : message,
      );

      setMessages(editedHistory);
      setError(null);
      setIsLoading(true);

      try {
        await streamAssistantReply(editedHistory);
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;
        setStreamingId(null);
        setError(
          err instanceof Error ? err.message : "Could not regenerate reply.",
        );
      } finally {
        setIsLoading(false);
        sendInFlightRef.current = false;
      }
    },
    [chatDisabled, messages, setMessages, streamAssistantReply],
  );

  const handleMessageFeedback = useCallback(
    (messageId: string, feedback: Parameters<typeof setMessageFeedback>[1]) => {
      setMessageFeedback(messageId, feedback);
    },
    [setMessageFeedback],
  );

  const sidebarConversations = useMemo(
    () =>
      conversations.filter(
        (c) => conversationHasUserContent(c) || c.id === activeId,
      ),
    [conversations, activeId],
  );

  const scrollChatToTop = useCallback(() => {
    const el = chatScrollRef.current;
    if (!el) return;
    el.scrollTo({ top: 0, behavior: "auto" });
  }, []);

  const resetEphemeralState = useCallback(() => {
    setInput("");
    setPendingAttachment(null);
    setAttachmentJustAdded(false);
    setError(null);
    setDocTruncated(false);
    setLastAuditFilename(undefined);
    setShowTemplates(false);
    setActiveSuggestionLabels(undefined);
    setStreamingId(null);
    setIsLoading(false);
    setIsAnalyzingDoc(false);
    resetUploadProgress();
  }, [resetUploadProgress]);

  const handleSelectChat = useCallback(
    (id: string) => {
      if (id === activeId) {
        setSidebarOpen(false);
        return;
      }
      speechController.stop();
      stopGeneration();
      selectChat(id);
      resetEphemeralState();
      setView("chat");
      setSidebarOpen(false);
      scrollChatToTop();
    },
    [
      activeId,
      selectChat,
      stopGeneration,
      resetEphemeralState,
      scrollChatToTop,
    ],
  );

  const handleExport = useCallback(async () => {
    try {
      if (auditMessage) {
        await exportReport({
          analysisContent: auditMessage.content,
          sourceFilename: lastAuditFilename,
          projectName: auditProjectName,
        });
        return;
      }

      if (!active) {
        onToast({
          type: "error",
          message: "No conversation to export.",
        });
        return;
      }

      const md = exportConversationMarkdown(active);
      const blob = new Blob([md], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `neurix-${active.title.replace(/\s+/g, "-")}.md`;
      a.click();
      URL.revokeObjectURL(url);
      onToast({
        type: "success",
        message: "Conversation exported as Markdown",
      });
    } catch (err) {
      onToast({
        type: "error",
        message:
          err instanceof Error ? err.message : "Export failed. Try again.",
      });
    }
  }, [
    active,
    auditMessage,
    lastAuditFilename,
    auditProjectName,
    exportReport,
    onToast,
  ]);

  const handleNewChat = useCallback(() => {
    speechController.stop();
    stopGeneration();
    sendInFlightRef.current = false;
    abortRef.current = null;
    newChat();
    resetEphemeralState();
    setView("chat");
    setSidebarOpen(false);
    scrollChatToTop();
  }, [newChat, stopGeneration, resetEphemeralState, scrollChatToTop]);

  const openUploadFlow = useCallback(() => {
    openDocumentPicker(handleFileSelected);
  }, [handleFileSelected]);

  const loaderStatus = isAnalyzingDoc
    ? "analyzing"
    : isLoading
      ? "generating"
      : "thinking";

  const showLoader = (isLoading || isAnalyzingDoc) && !streamingId;

  if (!hydrated) {
    return <ChatShellSkeleton />;
  }

  return (
    <div className="relative flex h-[100dvh] max-w-[100vw] flex-col overflow-x-hidden overflow-y-hidden">
      <BackgroundEffects />

      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onNewChat={handleNewChat}
        conversations={sidebarConversations}
        activeId={activeId}
        onSelectChat={handleSelectChat}
        onDeleteChat={deleteChat}
        onOpenDashboard={() => setView("dashboard")}
        aiMode={aiMode}
        onModeChange={setAiMode}
        onTemplateSelect={(t) => {
          setInput(t);
          setView("chat");
        }}
        onBookConsultation={() => setConsultationOpen(true)}
      />

      <div className="relative z-10 flex min-h-0 flex-1 flex-col">
        <Navbar
          view={view}
          onViewChange={setView}
          onBookConsultation={() => setConsultationOpen(true)}
          onSidebarOpen={() => setSidebarOpen(true)}
          onExportChat={() => void handleExport()}
          exportPdfMode={!!auditMessage}
          exportLoading={isExporting}
          aiMode={aiMode}
          onModeChange={setAiMode}
        />

        <main className="main-stage relative flex min-h-0 w-full min-w-0 max-w-full flex-1 flex-col overflow-x-hidden">
          {view === "dashboard" ? (
            <div className="chat-scroll min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto">
              <DashboardView
                conversations={conversations}
                onOpenChat={() => setView("chat")}
              />
            </div>
          ) : (
            <>
              <div
                ref={chatScrollRef}
                className="chat-scroll min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto"
              >
                {showHero ? (
                  <div className="w-full">
                    <ChatHero
                      onTileSelect={handleFeatureTileSelect}
                      onChipSelect={(text) => void sendMessage(text)}
                      onUploadClick={openUploadFlow}
                      suggestionLabels={activeSuggestionLabels}
                      chipsDisabled={chatDisabled}
                    />
                    <div className="content-shell pb-8">
                      <button
                        type="button"
                        onClick={() => setShowTemplates((s) => !s)}
                        className="rounded-full px-3 py-1.5 text-base font-semibold text-purple-200/95 transition-all hover:bg-purple-500/10 hover:text-purple-50 hover:shadow-[0_0_24px_rgba(168,85,247,0.24)]"
                      >
                        {showTemplates ? "Hide" : "Explore"} template marketplace
                      </button>
                      {showTemplates && (
                        <div className="mt-4">
                          <TemplateMarketplace
                            onSelect={(p) => void sendMessage(p)}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <ChatMessageList
                    messages={messages}
                    streamingId={streamingId}
                    lastAssistantIndex={lastAssistantIndex}
                    docTruncated={docTruncated}
                    auditProjectName={auditProjectName}
                    lastAuditFilename={lastAuditFilename}
                    onFeedback={handleMessageFeedback}
                    onEditUserMessage={handleEditUserMessage}
                    onRegenerate={handleRegenerate}
                  />
                )}

                <AnimatePresence>
                  {showLoader && (
                    <div className="mx-auto w-full max-w-4xl px-4 pb-6 sm:px-6 lg:max-w-5xl lg:px-8">
                      <TypingLoader
                        status={loaderStatus}
                        uploadProgress={
                          isAnalyzingDoc ? uploadProgress : undefined
                        }
                      />
                    </div>
                  )}
                </AnimatePresence>
                <div ref={chatEndRef} className="h-4" />
              </div>

              {error && (
                <div
                  role="alert"
                  className="flex shrink-0 items-center justify-center gap-3 border-t border-red-500/15 bg-red-500/8 px-4 py-3 text-center text-sm text-red-300 sm:px-6"
                >
                  <p className="flex-1">{error}</p>
                  <button
                    type="button"
                    onClick={() => setError(null)}
                    className="shrink-0 rounded-lg px-2 py-1 text-xs font-medium text-red-200/90 ring-1 ring-red-400/30 hover:bg-red-500/15"
                    aria-label="Dismiss error"
                  >
                    Dismiss
                  </button>
                </div>
              )}

              <ChatComposer
                input={input}
                onInputChange={setInput}
                onSubmit={() => void sendMessage()}
                onStop={stopGeneration}
                onFileSelected={handleFileSelected}
                attachedFile={pendingAttachment}
                attachmentJustAdded={attachmentJustAdded}
                onRemoveAttachment={() => {
                  setPendingAttachment(null);
                  setAttachmentJustAdded(false);
                }}
                onPasteLink={handlePasteLink}
                onChipSelect={(text) => void sendMessage(text)}
                disabled={chatDisabled}
                isGenerating={isGenerating}
                canSubmit={canSubmit}
                showQuickActions={!showHero}
                suggestionLabels={activeSuggestionLabels}
                inputRef={composerInputRef}
              />
            </>
          )}
        </main>
      </div>

      <ConsultationModal
        open={consultationOpen}
        onClose={() => setConsultationOpen(false)}
      />
      <PricingModal
        open={pricingOpen}
        onClose={() => setPricingOpen(false)}
        onBook={() => {
          setPricingOpen(false);
          setConsultationOpen(true);
        }}
      />
    </div>
  );
}
