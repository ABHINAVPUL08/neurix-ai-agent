"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { Volume2, VolumeX } from "lucide-react";

type VoiceControlsProps = {
  voiceMuted: boolean;
  onToggleMuted: () => void;
  compact?: boolean;
  disabled?: boolean;
};

function VoiceControlsInner({
  voiceMuted,
  onToggleMuted,
  compact,
  disabled,
}: VoiceControlsProps) {
  const Icon = voiceMuted ? VolumeX : Volume2;
  const label = voiceMuted ? "Unmute AI voice" : "Mute AI voice";

  return (
    <motion.button
      type="button"
      onClick={onToggleMuted}
      disabled={disabled}
      whileHover={disabled ? undefined : { scale: 1.03 }}
      whileTap={disabled ? undefined : { scale: 0.97 }}
      aria-pressed={voiceMuted}
      aria-label={label}
      title={label}
      className={`flex shrink-0 items-center justify-center rounded-full border transition-all disabled:opacity-40 ${
        voiceMuted
          ? "border-zinc-600/50 bg-zinc-900/40 text-zinc-400 hover:border-purple-500/30 hover:text-purple-200"
          : "border-purple-400/40 bg-purple-500/15 text-purple-100 shadow-[0_0_16px_rgba(168,85,247,0.2)] hover:border-purple-300/55 hover:bg-purple-500/22"
      } ${
        compact
          ? "h-8 w-8"
          : "h-9 w-9 lg:h-10 lg:w-10"
      }`}
    >
      <Icon className={compact ? "h-3.5 w-3.5" : "h-4 w-4"} />
    </motion.button>
  );
}

export const VoiceControls = memo(VoiceControlsInner);
