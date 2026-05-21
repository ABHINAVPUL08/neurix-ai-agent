"use client";

import { ChevronDown } from "lucide-react";
import { AI_MODES, type AiModeId } from "@/lib/ai-modes";

type ModeSelectorProps = {
  value: AiModeId;
  onChange: (mode: AiModeId) => void;
  compact?: boolean;
  variant?: "default" | "header" | "compact";
};

export function ModeSelector({
  value,
  onChange,
  compact,
  variant = compact ? "compact" : "default",
}: ModeSelectorProps) {
  const resolvedVariant = compact ? "compact" : variant;
  const current = AI_MODES.find((m) => m.id === value) ?? AI_MODES[0];

  const selectClass =
    "w-full appearance-none rounded-xl border border-purple-500/40 bg-black/50 text-zinc-100 backdrop-blur-xl transition-all duration-200 hover:border-purple-400/55 hover:shadow-[0_0_28px_rgba(168,85,247,0.22)] focus:border-purple-400/65 focus:outline-none focus:shadow-[0_0_32px_rgba(168,85,247,0.32)]";

  if (resolvedVariant === "header") {
    return (
      <div className="navbar-mode-stack flex w-full max-w-full flex-col items-center justify-center">
        <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-400 sm:tracking-[0.2em] lg:text-[11px]">
          AI Mode
        </span>
        <div className="navbar-mode-wrap relative mt-1.5 w-full max-w-[min(240px,calc(100vw-2rem))] sm:mt-2 sm:max-w-[min(280px,calc(100vw-2.5rem))] md:max-w-[320px] lg:mt-2 lg:w-[340px] lg:max-w-[340px]">
          <select
            value={value}
            onChange={(e) => onChange(e.target.value as AiModeId)}
            aria-label="AI Mode"
            className={`${selectClass} navbar-mode-select h-10 w-full cursor-pointer pl-3 pr-9 text-center text-[13px] font-semibold text-purple-50 sm:h-11 sm:pl-4 sm:pr-10 sm:text-sm lg:h-[46px] lg:text-[15px]`}
          >
            {AI_MODES.map((mode) => (
              <option key={mode.id} value={mode.id} className="bg-zinc-900 py-2">
                {mode.label}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-purple-300 sm:right-3 sm:h-4 sm:w-4 lg:right-3.5 lg:h-5 lg:w-5" />
        </div>
        <p className="mt-1.5 max-w-[min(240px,calc(100vw-2rem))] truncate px-1 text-center text-[10px] leading-snug text-zinc-500 sm:mt-2 sm:max-w-[min(280px,calc(100vw-2.5rem))] sm:text-[11px] md:max-w-[320px] lg:max-w-[340px] lg:text-xs">
          {current.description}
        </p>
      </div>
    );
  }

  return (
    <div className={resolvedVariant === "compact" ? "w-full" : "relative min-w-[160px]"}>
      <label className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-400">
        AI Mode
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value as AiModeId)}
          className={`${selectClass} pl-4 pr-10 ${
            resolvedVariant === "compact" ? "py-3 text-base" : "py-2.5 text-sm"
          } font-medium`}
        >
          {AI_MODES.map((mode) => (
            <option key={mode.id} value={mode.id} className="bg-zinc-900">
              {mode.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-purple-300" />
      </div>
      {resolvedVariant !== "compact" && (
        <p className="mt-1.5 text-sm text-zinc-500">{current.description}</p>
      )}
    </div>
  );
}
