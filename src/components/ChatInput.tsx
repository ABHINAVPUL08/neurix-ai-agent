"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp, Square, Paperclip } from "lucide-react";
import { FormEvent, KeyboardEvent, forwardRef, memo, useRef } from "react";
import { useAutoResizeTextarea } from "@/hooks/useAutoResizeTextarea";

type ChatInputProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onStop: () => void;
  onUploadClick: () => void;
  disabled: boolean;
  isGenerating: boolean;
  canSubmit: boolean;
};

const ChatInputInner = forwardRef<HTMLTextAreaElement, ChatInputProps>(
  function ChatInput(
    {
      value,
      onChange,
      onSubmit,
      onStop,
      onUploadClick,
      disabled,
      isGenerating,
      canSubmit,
    },
    forwardedRef,
  ) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  useAutoResizeTextarea(value, textareaRef);

  const setTextareaRef = (el: HTMLTextAreaElement | null) => {
    textareaRef.current = el;
    if (typeof forwardedRef === "function") forwardedRef(el);
    else if (forwardedRef) forwardedRef.current = el;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (isGenerating) {
      onStop();
      return;
    }
    if (!canSubmit || disabled) return;
    onSubmit();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (isGenerating) {
        onStop();
        return;
      }
      if (!canSubmit || disabled) return;
      onSubmit();
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="chat-input-float rounded-xl px-3 py-2.5 transition-all duration-200 sm:rounded-2xl sm:px-5 sm:py-4"
    >
      <div className="flex items-end gap-2 sm:gap-3">
        <motion.button
          type="button"
          onClick={onUploadClick}
          disabled={disabled || isGenerating}
          whileHover={{ scale: 1.05, y: -1 }}
          whileTap={{ scale: 0.95 }}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-zinc-400 transition-all duration-200 hover:bg-purple-500/15 hover:text-purple-300 hover:shadow-[0_0_24px_rgba(168,85,247,0.28)] disabled:opacity-40 sm:h-12 sm:w-12 sm:rounded-xl"
          aria-label="Attach document"
        >
          <Paperclip className="h-5 w-5" />
        </motion.button>

        <textarea
          ref={setTextareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            isGenerating
              ? "Neurix is responding…"
              : "Ask Neurix anything…"
          }
          rows={1}
          disabled={disabled}
          className="max-h-40 min-h-[42px] flex-1 resize-none overflow-y-auto bg-transparent px-0.5 py-2.5 text-[15px] leading-[1.55] text-zinc-100 placeholder:text-zinc-500 focus:outline-none disabled:opacity-50 sm:max-h-48 sm:min-h-[54px] sm:px-1 sm:py-4 sm:text-base sm:leading-relaxed lg:min-h-[58px] lg:text-[17px]"
        />

        <AnimatePresence mode="wait">
          {isGenerating ? (
            <motion.button
              key="stop"
              type="button"
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={onStop}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.94 }}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border-2 border-zinc-300/90 bg-zinc-100 text-zinc-900 shadow-[0_0_32px_rgba(255,255,255,0.25)] hover:shadow-[0_0_40px_rgba(168,85,247,0.4)] sm:h-12 sm:w-12 sm:rounded-xl"
              aria-label="Stop generating"
            >
              <Square className="h-5 w-5 fill-current sm:h-6 sm:w-6" />
            </motion.button>
          ) : (
            <motion.button
              key="send"
              type="submit"
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ duration: 0.2 }}
              disabled={disabled || !canSubmit}
              whileHover={{ scale: disabled || !canSubmit ? 1 : 1.06, y: -1 }}
              whileTap={{ scale: disabled || !canSubmit ? 1 : 0.94 }}
              className="breathing-send flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-violet-600 text-white shadow-xl shadow-purple-600/50 transition-all duration-200 hover:shadow-[0_0_48px_rgba(168,85,247,0.65)] disabled:cursor-not-allowed disabled:opacity-40 sm:h-12 sm:w-12 sm:rounded-xl"
              aria-label="Send message"
            >
              <ArrowUp className="h-6 w-6" strokeWidth={2.5} />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </form>
  );
  },
);

export const ChatInput = memo(ChatInputInner);
