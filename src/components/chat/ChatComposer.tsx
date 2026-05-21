"use client";

import { useRef, type RefObject } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  onChipSelect: (text: string) => void;
  disabled: boolean;
  isGenerating: boolean;
  canSubmit: boolean;
  showQuickActions?: boolean;
  suggestionLabels?: string[];
  inputRef?: RefObject<HTMLTextAreaElement | null>;
};

export function ChatComposer({
  input,
  onInputChange,
  onSubmit,
  onStop,
  onFileSelected,
  attachedFile,
  attachmentJustAdded,
  onRemoveAttachment,
  onChipSelect,
  disabled,
  isGenerating,
  canSubmit,
  showQuickActions = true,
  suggestionLabels,
  inputRef,
}: ChatComposerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFileSelected(file);
    e.target.value = "";
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

      <div className="composer-dock-inner content-shell pb-4 pt-2 sm:pb-8 sm:pt-4">
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
        />
      </div>
    </div>
  );
}
