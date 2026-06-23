"use client";

import { memo } from "react";

const BAR_COUNT = 5;

function VoiceWaveformInner({ active }: { active: boolean }) {
  return (
    <div
      className="flex h-4 items-end gap-0.5"
      role="img"
      aria-label={active ? "AI speaking" : "Voice idle"}
    >
      {Array.from({ length: BAR_COUNT }, (_, i) => (
        <span
          key={i}
          className={`voice-wave-bar w-0.5 rounded-full bg-purple-300/90 ${
            active ? "voice-wave-bar--active" : "h-1 opacity-35"
          }`}
          style={
            active
              ? ({
                  animationDelay: `${i * 0.12}s`,
                } as React.CSSProperties)
              : undefined
          }
        />
      ))}
    </div>
  );
}

export const VoiceWaveform = memo(VoiceWaveformInner);
