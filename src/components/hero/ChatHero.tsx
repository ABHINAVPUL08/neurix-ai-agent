"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  Bot,
  Mic,
  ScanText,
  Workflow,
  LayoutDashboard,
  Sparkles,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { SuggestionChips } from "@/components/chat/SuggestionChips";
import {
  FEATURE_TILES,
  type FeatureTileId,
} from "@/lib/feature-tiles";

const TILE_ICONS: Record<FeatureTileId, LucideIcon> = {
  "ai-agents": Bot,
  saas: LayoutDashboard,
  ocr: ScanText,
  voice: Mic,
  workflow: Workflow,
  "business-tools": Sparkles,
};

type ChatHeroProps = {
  onTileSelect: (tileId: FeatureTileId) => void;
  onChipSelect: (text: string) => void;
  onUploadClick: () => void;
  suggestionLabels?: string[];
  chipsDisabled?: boolean;
};

export function ChatHero({
  onTileSelect,
  onChipSelect,
  onUploadClick,
  suggestionLabels,
  chipsDisabled,
}: ChatHeroProps) {
  return (
    <section className="hero-section relative w-full overflow-hidden">
      <div className="hero-ambient pointer-events-none absolute inset-0" aria-hidden />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="content-shell hero-shell relative flex flex-col items-center py-14 text-center sm:py-16 lg:py-20"
      >
        <div className="hero-title-wrap relative">
          <div
            className="hero-title-glow pointer-events-none absolute inset-0 -z-10 scale-[1.8] blur-3xl"
            aria-hidden
          />
          <h1 className="text-shimmer relative text-[2rem] font-bold leading-tight tracking-tight sm:text-4xl lg:text-[2.75rem]">
            Neurix AI Agent
          </h1>
        </div>

        <p className="hero-subtitle mt-6 max-w-[42rem] text-base leading-[1.7] text-zinc-400 sm:text-lg lg:mt-8 lg:text-xl lg:leading-[1.75]">
          Your premium AI business consultant — automation, SaaS, voice agents,
          and workflows built for your industry.
        </p>

        <div className="feature-grid mt-14 w-full sm:mt-16 lg:mt-[4.5rem]">
          {FEATURE_TILES.map((tile, i) => {
            const Icon = TILE_ICONS[tile.id];
            return (
              <motion.button
                key={tile.id}
                type="button"
                disabled={chipsDisabled}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 + i * 0.04, duration: 0.4 }}
                whileHover={
                  chipsDisabled
                    ? undefined
                    : {
                        y: -6,
                        scale: 1.02,
                        boxShadow: "0 0 40px rgba(168,85,247,0.35)",
                      }
                }
                whileTap={chipsDisabled ? undefined : { scale: 0.98, y: -2 }}
                onClick={() => onTileSelect(tile.id)}
                className="feature-card feature-card-interactive group relative flex min-h-[148px] w-full cursor-pointer flex-col rounded-2xl border border-purple-500/25 bg-gradient-to-br from-purple-950/40 via-black/30 to-black/50 p-6 text-left backdrop-blur-md transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/60 disabled:cursor-not-allowed disabled:opacity-50 sm:min-h-[156px] sm:p-7"
                aria-label={`Open ${tile.label} workflow`}
              >
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-600/20 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <Icon className="relative mb-5 h-9 w-9 text-purple-300 transition-all duration-300 group-hover:text-purple-200 group-hover:drop-shadow-[0_0_12px_rgba(168,85,247,0.55)] sm:h-10 sm:w-10" />
                <h3 className="relative text-base font-semibold text-zinc-100 sm:text-lg">
                  {tile.label}
                </h3>
                <p className="relative mt-1.5 text-sm leading-relaxed text-zinc-500 transition-colors duration-300 group-hover:text-zinc-400">
                  {tile.description}
                </p>
                <div className="relative mt-auto flex justify-end pt-5">
                  <ArrowRight className="h-4 w-4 text-purple-400/50 transition-all duration-300 group-hover:translate-x-1 group-hover:text-purple-300" />
                </div>
              </motion.button>
            );
          })}
        </div>

        <div className="quick-actions-row mt-10 w-full sm:mt-12 lg:mt-14">
          <SuggestionChips
            disabled={chipsDisabled}
            labels={suggestionLabels}
            onSelect={(text) => {
              if (text === "Upload Project PDF") onUploadClick();
              else onChipSelect(text);
            }}
          />
        </div>
      </motion.div>
    </section>
  );
}
