"use client";

import dynamic from "next/dynamic";
import { memo, useState, useRef, type DragEvent, type RefObject } from "react";
import type { VoiceUiStatus } from "@/components/voice/VoiceStatusLabel";
import { motion, AnimatePresence } from "framer-motion";
import { Link2, UploadCloud } from "lucide-react";
import { ChatInput } from "@/components/ChatInput";
import { SuggestionChips } from "@/components/chat/SuggestionChips";
import { AttachedFileChip } from "@/components/chat/AttachedFileChip";
import { DOCUMENT_ACCEPT } from "@/lib/validate-document-file";

type ChatComposerProps = {
  input: string;
  onInputChange: (value: string) => void;
  onSubmit: () => void;
  onStop: () => void;
  onFileSelected: (file: File) => void;
  attachedFile: File | null;
  attachmentJustAdded?: boolean;
  onRemoveAttachment: () => void;
  onPasteLink: () => void;
  onChipSelect: (text: string) => void;
  disabled: boolean;
  isGenerating: boolean;
  canSubmit: boolean;
  showQuickActions?: boolean;
  suggestionLabels?: string[];
  inputRef?: RefObject<HTMLTextAreaElement | null>;
  voiceStatus?: VoiceUiStatus;
  isListening?: boolean;
  isSpeaking?: boolean;
  voiceSupported?: boolean;
  onVoiceToggle?: () => void;
};

const VoiceStatusLabel = dynamic(
  () =>
    import("@/components/voice/VoiceStatusLabel").then(
      (m) => m.VoiceStatusLabel,
    ),
  { ssr: false },
);

function ChatComposerInner({
  input,
  onInputChange,
  onSubmit,
  onStop,
  onFileSelected,
  attachedFile,
  attachmentJustAdded,
  onRemoveAttachment,
  onPasteLink,
  onChipSelect,
  disabled,
  isGenerating,
  canSubmit,
  showQuickActions = true,
  suggestionLabels,
  inputRef,
  voiceStatus = null,
  isListening = false,
  isSpeaking = false,
  voiceSupported = false,
  onVoiceToggle,
}: ChatComposerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFileSelected(file);
    e.target.value = "";
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!disabled && !isGenerating) setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
      setIsDragging(false);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled || isGenerating) return;
    const file = e.dataTransfer.files?.[0];
    if (file) onFileSelected(file);
  };

  return (
    <div className="composer-dock sticky bottom-0 z-20 w-full shrink-0">
      <input
        ref={fileInputRef}
        type="file"
        accept={DOCUMENT_ACCEPT}
        className="hidden"
        onChange={handleFileChange}
        aria-hidden
      />

      <div
        className="composer-dock-inner content-shell pb-4 pt-2 sm:pb-8 sm:pt-4"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <AnimatePresence>
          {isDragging && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="pointer-events-none absolute inset-x-4 bottom-4 top-2 z-30 flex items-center justify-center rounded-2xl border border-purple-400/45 bg-purple-950/35 text-purple-100 shadow-[0_0_60px_rgba(168,85,247,0.34)] backdrop-blur-xl sm:bottom-8 sm:top-4"
            >
              <div className="flex flex-col items-center gap-2 text-center">
                <motion.div
                  animate={{ y: [0, -4, 0], opacity: [0.85, 1, 0.85] }}
                  transition={{ duration: 1.1, repeat: Infinity }}
                  className="rounded-2xl bg-purple-500/20 p-3 ring-1 ring-purple-300/35"
                >
                  <UploadCloud className="h-6 w-6 text-purple-100" />
                </motion.div>
                <p className="text-sm font-semibold">Drop file to attach</p>
                <p className="text-xs text-purple-100/65">
                  Images, PDFs, documents
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {showQuickActions && (
          <div className="quick-actions-row mb-3 sm:mb-6">
            <SuggestionChips
              disabled={disabled || isGenerating}
              labels={suggestionLabels}
              onSelect={(text) => {
                if (text === "Upload Project PDF") openFilePicker();
                else onChipSelect(text);
              }}
            />
          </div>
        )}

        <AnimatePresence mode="popLayout">
          {attachedFile && (
            <motion.div
              key={attachedFile.name + attachedFile.size}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 overflow-hidden"
            >
              <AttachedFileChip
                file={attachedFile}
                showSuccess={attachmentJustAdded}
                onRemove={onRemoveAttachment}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mb-2 flex justify-end">
          <motion.button
            type="button"
            onClick={onPasteLink}
            disabled={disabled || isGenerating}
            whileHover={{ scale: 1.03, y: -1 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-2 rounded-full border border-purple-400/45 bg-purple-500/15 px-4 py-2 text-sm font-semibold text-purple-100 shadow-[0_0_18px_rgba(168,85,247,0.16)] transition-all hover:border-purple-300/60 hover:bg-purple-500/20 hover:text-white hover:shadow-[0_0_26px_rgba(168,85,247,0.28)] disabled:opacity-40"
          >
            <Link2 className="h-4 w-4" />
            Paste Link
          </motion.button>
        </div>

        <VoiceStatusLabel status={voiceStatus} />

        <ChatInput
          ref={inputRef}
          value={input}
          onChange={onInputChange}
          onSubmit={onSubmit}
          onStop={onStop}
          onUploadClick={openFilePicker}
          disabled={disabled}
          isGenerating={isGenerating}
          canSubmit={canSubmit}
          isListening={isListening}
          isSpeaking={isSpeaking}
          voiceSupported={voiceSupported}
          onVoiceToggle={onVoiceToggle}
        />
      </div>
    </div>
  );
}

export const ChatComposer = memo(ChatComposerInner);
