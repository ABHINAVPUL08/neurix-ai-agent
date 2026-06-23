"use client";

import { memo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { VoiceWaveform } from "@/components/voice/VoiceWaveform";

export type VoiceUiStatus = "listening" | "thinking" | "speaking" | null;

const LABELS: Record<Exclude<VoiceUiStatus, null>, string> = {
  listening: "Listening…",
  thinking: "Thinking…",
  speaking: "Speaking…",
};

function VoiceStatusLabelInner({ status }: { status: VoiceUiStatus }) {
  return (
    <AnimatePresence mode="wait">
      {status ? (
        <motion.div
          key={status}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.2 }}
          className={`mb-2 flex items-center justify-center gap-2 ${
            status === "speaking" ? "voice-status-speaking" : ""
          }`}
        >
          {status === "listening" && (
            <span
              className="voice-mic-pulse h-2 w-2 rounded-full bg-purple-400"
              aria-hidden
            />
          )}
          {status === "speaking" && <VoiceWaveform active />}
          {status === "thinking" && (
            <span className="h-2 w-2 animate-pulse rounded-full bg-purple-400/80" />
          )}
          <span className="text-xs font-medium tracking-wide text-purple-200/90 sm:text-sm">
            {LABELS[status]}
          </span>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export const VoiceStatusLabel = memo(VoiceStatusLabelInner);
