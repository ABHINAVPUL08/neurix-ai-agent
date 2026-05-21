"use client";

import { motion } from "framer-motion";
import { Volume2, VolumeX } from "lucide-react";
import { useEffect } from "react";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";
import { warmSpeechVoices } from "@/lib/speech-controller";

type SpeechButtonProps = {
  messageId: string;
  text: string;
};

export function SpeechButton({ messageId, text }: SpeechButtonProps) {
  const { isSpeaking, isSupported, toggle } = useSpeechSynthesis({
    messageId,
    text,
  });

  useEffect(() => {
    warmSpeechVoices();
  }, []);

  if (!isSupported) return null;

  return (
    <motion.button
      type="button"
      onClick={toggle}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
      aria-label={isSpeaking ? "Stop reading aloud" : "Read aloud"}
      aria-pressed={isSpeaking}
      className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all duration-300 sm:h-11 sm:w-11 ${
        isSpeaking
          ? "bg-purple-500/35 text-purple-100 shadow-[0_0_24px_rgba(168,85,247,0.55)] ring-2 ring-purple-400/70"
          : "text-zinc-400 hover:bg-purple-500/15 hover:text-purple-300 hover:shadow-[0_0_16px_rgba(168,85,247,0.25)]"
      }`}
    >
      {isSpeaking && (
        <>
          <motion.span
            className="absolute inset-0 rounded-xl bg-purple-500/25"
            animate={{ opacity: [0.4, 0.85, 0.4] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
            aria-hidden
          />
          <motion.span
            className="absolute -inset-1 rounded-xl ring-2 ring-purple-400/70"
            animate={{ scale: [1, 1.1, 1], opacity: [0.7, 0.2, 0.7] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
            aria-hidden
          />
        </>
      )}

      {isSpeaking ? (
        <VolumeX className="relative h-5 w-5 drop-shadow-[0_0_8px_rgba(192,132,252,0.8)]" strokeWidth={2.5} />
      ) : (
        <Volume2 className="relative h-5 w-5" strokeWidth={2} />
      )}
    </motion.button>
  );
}
