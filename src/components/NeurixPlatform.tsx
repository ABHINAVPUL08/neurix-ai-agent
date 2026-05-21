"use client";

import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BackgroundOrbs } from "@/components/BackgroundOrbs";
import { ParticleField } from "@/components/effects/ParticleField";
import { ParallaxGlow } from "@/components/effects/ParallaxGlow";
import { ChatMessage } from "@/components/ChatMessage";
import { Navbar } from "@/components/Navbar";
import { TypingLoader } from "@/components/TypingLoader";
import { ChatHero } from "@/components/hero/ChatHero";
import { TemplateMarketplace } from "@/components/templates/TemplateMarketplace";
import { ChatComposer } from "@/components/chat/ChatComposer";
import { Sidebar } from "@/components/layout/Sidebar";
import { ConsultationModal } from "@/components/modals/ConsultationModal";
import { PricingModal } from "@/components/pricing/PricingModal";
import { ExportToast, type ExportToastState } from "@/components/ui/ExportToast";
import {
  AuditExportProvider,
  useAuditExport,
} from "@/contexts/AuditExportContext";
import type { AnalysisMeta } from "@/hooks/useDocumentAnalysis";
import { useChatSessions } from "@/hooks/useChatSessions";
import { analyzeDocumentFile } from "@/lib/analyze-document-client";
import { fetchChatReply, fetchChatReplyStream } from "@/lib/chat-api";
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
    uploadedFiles,
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
  const chatEndRef = useRef<HTMLDivElement>(null);
  const composerInputRef = useRef<HTMLTextAreaElement>(null);
  const scrollThrottleRef = useRef(0);
  const abortRef = useRef<AbortController | null>(null);

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
    scrollThrottleRef.current = now;
    chatEndRef.current?.scrollIntoView({
      behavior: streamingId ? "auto" : "smooth",
      block: "end",
    });
  }, [messages.length, isLoading, isAnalyzingDoc, streamingId, view]);

  useEffect(() => () => speechController.stop(), []);

  const stopGeneration = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setStreamingId(null);
    setIsLoading(false);
    setIsAnalyzingDoc(false);
  }, []);

  const streamAssistantReply = useCallback(
    async (history: ChatMessageItem[]) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      const assistantMsg = createMessage("assistant", "");
      setMessages((prev) => [...prev, assistantMsg]);
      setStreamingId(assistantMsg.id);
      setIsLoading(false);

      await new Promise<void>((resolve, reject) => {
        fetchChatReplyStream(history, aiMode, WELCOME_ID, {
          signal: controller.signal,
          onChunk: (chunk) => {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantMsg.id
                  ? { ...m, content: m.content + chunk }
                  : m,
              ),
            );
          },
          onDone: () => resolve(),
          onError: (err) => {
            if (err.name === "AbortError") resolve();
            else reject(err);
          },
        });
      });

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
      if ((!trimmed && !file) || chatDisabled) return;

      setView("chat");
      setShowTemplates(false);
      setError(null);

      if (file) {
        const fileToSend = file;
        setPendingAttachment(null);
        setAttachmentJustAdded(false);
        setInput("");

        const userNote = trimmed
          ? `${trimmed}\n\n📄 **Attached:** ${fileToSend.name}`
          : `📄 **Project document uploaded:** ${fileToSend.name}\n\nPlease review my business/project document and provide your structured analysis.`;

        setMessages((prev) => [...prev, createMessage("user", userNote)]);
        setIsAnalyzingDoc(true);
        setIsLoading(true);

        abortRef.current?.abort();
        const controller = new AbortController();
        abortRef.current = controller;

        try {
          const { analysis, meta } = await analyzeDocumentFile(
            fileToSend,
            controller.signal,
          );
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
          setMessages((prev) => {
            const cleaned = prev.filter(
              (m) => m.content.trim() !== "" || m.role === "user",
            );
            return [...cleaned, createMessage("assistant", reply)];
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
    ],
  );

  const handleRegenerate = useCallback(async () => {
    if (chatDisabled || lastAssistantIndex < 0) return;
    const withoutLast = messages.slice(0, lastAssistantIndex);
    setMessages(withoutLast);
    setError(null);
    setIsLoading(true);
    try {
      await streamAssistantReply(withoutLast);
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
      setError(
        err instanceof Error ? err.message : "Regeneration failed.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [
    chatDisabled,
    lastAssistantIndex,
    messages,
    streamAssistantReply,
    setMessages,
  ]);

  const handleMessageFeedback = useCallback(
    (messageId: string, feedback: Parameters<typeof setMessageFeedback>[1]) => {
      setMessageFeedback(messageId, feedback);
    },
    [setMessageFeedback],
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
    newChat();
    setInput("");
    setPendingAttachment(null);
    setAttachmentJustAdded(false);
    setError(null);
    setView("chat");
    setShowTemplates(false);
    setActiveSuggestionLabels(undefined);
  }, [newChat, stopGeneration]);

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
    return (
      <div className="flex h-[100dvh] items-center justify-center">
        <motion.div
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="text-sm text-purple-300"
        >
          Loading Neurix…
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative flex h-[100dvh] max-w-[100vw] flex-col overflow-x-hidden overflow-y-hidden">
      <BackgroundOrbs />
      <ParticleField />
      <ParallaxGlow />

      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onNewChat={handleNewChat}
        conversations={conversations}
        activeId={activeId}
        onSelectChat={selectChat}
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
              <div className="chat-scroll min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto">
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
                        className="text-sm font-medium text-purple-400 transition-colors hover:text-purple-200"
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
                  <div className="chat-messages-list content-shell min-w-0 space-y-6 py-4 sm:space-y-10 sm:py-8">
                    {messages.map((msg, i) => (
                      <ChatMessage
                        key={msg.id}
                        role={msg.role}
                        content={msg.content}
                        index={i}
                        createdAt={msg.createdAt}
                        kind={msg.kind}
                        truncatedNote={
                          msg.kind === "document-analysis" && docTruncated
                        }
                        projectName={auditProjectName}
                        sourceFilename={lastAuditFilename}
                        isStreaming={msg.id === streamingId}
                        feedback={msg.feedback}
                        onFeedback={(fb) =>
                          handleMessageFeedback(msg.id, fb)
                        }
                        canRegenerate={
                          i === lastAssistantIndex &&
                          msg.role === "assistant" &&
                          msg.id !== streamingId
                        }
                        onRegenerate={
                          i === lastAssistantIndex
                            ? handleRegenerate
                            : undefined
                        }
                      />
                    ))}
                  </div>
                )}

                <AnimatePresence>
                  {showLoader && (
                    <div className="mx-auto w-full max-w-4xl px-4 pb-6 sm:px-6 lg:max-w-5xl lg:px-8">
                      <TypingLoader status={loaderStatus} />
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
