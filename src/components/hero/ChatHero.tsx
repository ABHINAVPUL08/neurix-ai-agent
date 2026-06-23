"use client";

import { memo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Bot,
  Calculator,
  Check,
  LayoutGrid,
  Mic,
  Quote,
  ScanText,
  Star,
  Workflow,
  LayoutDashboard,
  Sparkles,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { SuggestionChips } from "@/components/chat/SuggestionChips";
import { RoiCalculator } from "@/components/hero/RoiCalculator";
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

const TRUST_ITEMS = [
  "AI Consultant",
  "Hindi + English Voice",
  "Free PDF Audit",
  "Projects from $300",
] as const;

const TESTIMONIALS = [
  {
    quote:
      "Neurix helped us plan our hotel WhatsApp automation in one session — clear roadmap, no jargon.",
    name: "Priya S.",
    role: "Hotel owner, Jaipur",
    initials: "PS",
    gradient: "from-fuchsia-600/30 to-purple-900/25",
  },
  {
    quote:
      "Uploaded our project PDF and got a full audit in minutes. The exported report looked client-ready.",
    name: "Rahul M.",
    role: "Startup founder",
    initials: "RM",
    gradient: "from-violet-600/30 to-purple-900/25",
  },
  {
    quote:
      "Hindi voice + Hinglish chat felt like talking to a real consultant, not a generic chatbot.",
    name: "Ananya K.",
    role: "Agency lead, Mumbai",
    initials: "AK",
    gradient: "from-indigo-600/30 to-purple-900/25",
  },
  {
    quote:
      "Our café in Delhi needed WhatsApp orders, table booking, and a Hindi menu bot — Neurix scoped it in one call and we were live in three weeks.",
    name: "Arjun D.",
    role: "Café owner, Delhi",
    initials: "AD",
    gradient: "from-amber-600/30 to-purple-900/25",
  },
] as const;

export type HeroTab = "services" | "testimonials" | "roi";

const HERO_TABS: { id: HeroTab; label: string; shortLabel: string; icon: LucideIcon }[] = [
  { id: "services", label: "Services", shortLabel: "Services", icon: LayoutGrid },
  { id: "testimonials", label: "Testimonials", shortLabel: "Reviews", icon: Quote },
  { id: "roi", label: "ROI Calculator", shortLabel: "ROI", icon: Calculator },
];

type ChatHeroProps = {
  onTileSelect: (tileId: FeatureTileId) => void;
  onChipSelect: (text: string) => void;
  onUploadClick: () => void;
  onBookConsultation: () => void;
  onHeroTabChange?: (tab: HeroTab) => void;
  suggestionLabels?: string[];
  chipsDisabled?: boolean;
};

function ChatHeroInner({
  onTileSelect,
  onChipSelect,
  onUploadClick,
  onBookConsultation,
  onHeroTabChange,
  suggestionLabels,
  chipsDisabled,
}: ChatHeroProps) {
  const [heroTab, setHeroTab] = useState<HeroTab>("services");

  const selectHeroTab = (tab: HeroTab) => {
    setHeroTab(tab);
    onHeroTabChange?.(tab);
  };

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
            Neurix Solution
          </h1>
        </div>

        <p className="hero-subtitle mt-6 max-w-[42rem] text-base leading-[1.7] text-zinc-400 sm:text-lg lg:mt-8 lg:text-xl lg:leading-[1.75]">
          Your premium AI business consultant — automation, SaaS, voice agents,
          and workflows built for your industry.
        </p>

        <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 sm:mt-8 sm:gap-x-6">
          {TRUST_ITEMS.map((item) => (
            <li
              key={item}
              className="flex items-center gap-1.5 text-xs font-medium text-zinc-400 sm:text-sm"
            >
              <Check
                className="h-3.5 w-3.5 shrink-0 text-purple-400"
                aria-hidden
              />
              <span>{item}</span>
            </li>
          ))}
        </ul>

        <div
          className="mt-8 w-full sm:mt-10"
          role="tablist"
          aria-label="Explore Neurix"
        >
          <p className="mb-3 text-center text-xs font-bold uppercase tracking-[0.2em] text-purple-300 sm:text-sm">
            Explore Neurix
          </p>
          <div className="hero-tab-bar mx-auto flex w-full max-w-3xl flex-col gap-2 sm:flex-row sm:gap-3">
            {HERO_TABS.map((tab) => {
              const active = heroTab === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  aria-controls={`hero-panel-${tab.id}`}
                  onClick={() => selectHeroTab(tab.id)}
                  className={`hero-tab-btn group relative flex flex-1 items-center justify-center gap-2 rounded-2xl border px-4 py-3.5 transition-all duration-200 sm:px-5 sm:py-4 ${
                    active
                      ? "hero-tab-btn--active border-purple-400/70 bg-gradient-to-r from-purple-600/90 to-violet-600/90 text-white shadow-[0_0_32px_rgba(168,85,247,0.45)]"
                      : "border-purple-500/35 bg-purple-950/40 text-zinc-200 hover:border-purple-400/50 hover:bg-purple-900/35 hover:text-white hover:shadow-[0_0_24px_rgba(168,85,247,0.2)]"
                  }`}
                >
                  <Icon
                    className={`h-5 w-5 shrink-0 sm:h-[1.35rem] sm:w-[1.35rem] ${
                      active
                        ? "text-white"
                        : "text-purple-400 group-hover:text-purple-300"
                    }`}
                    aria-hidden
                  />
                  <span className="relative z-10 text-sm font-bold sm:text-base">
                    <span className="sm:hidden">{tab.shortLabel}</span>
                    <span className="hidden sm:inline">{tab.label}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {heroTab === "testimonials" && (
            <motion.div
              key="testimonials"
              id="hero-panel-testimonials"
              role="tabpanel"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.28 }}
              className="mt-8 w-full sm:mt-10"
            >
              <p className="mb-5 text-center text-xs font-bold uppercase tracking-[0.2em] text-purple-300 sm:text-sm">
                Trusted by founders & teams
              </p>
              <div className="testimonial-grid grid gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-4">
                {TESTIMONIALS.map((item, i) => (
                  <motion.article
                    key={item.name}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.06 + i * 0.07, duration: 0.4 }}
                    whileHover={{
                      y: -6,
                      scale: 1.02,
                      boxShadow: "0 0 40px rgba(168,85,247,0.35)",
                    }}
                    className={`testimonial-card feature-card group relative flex min-h-[220px] flex-col rounded-2xl border border-purple-500/25 bg-gradient-to-br ${item.gradient} via-black/35 to-black/55 p-6 text-left backdrop-blur-md sm:min-h-[240px] sm:p-7`}
                  >
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-600/20 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    <div className="relative mb-4 flex items-start justify-between gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-violet-600 text-sm font-bold text-white shadow-[0_0_20px_rgba(168,85,247,0.45)] ring-2 ring-purple-400/30">
                        {item.initials}
                      </div>
                      <Quote
                        className="h-8 w-8 shrink-0 text-purple-400/35 transition-colors duration-300 group-hover:text-purple-300/55"
                        aria-hidden
                      />
                    </div>
                    <div
                      className="relative mb-4 flex gap-0.5"
                      aria-label="5 out of 5 stars"
                    >
                      {Array.from({ length: 5 }).map((_, starIndex) => (
                        <Star
                          key={starIndex}
                          className="h-3.5 w-3.5 fill-amber-400 text-amber-400 sm:h-4 sm:w-4"
                          aria-hidden
                        />
                      ))}
                    </div>
                    <p className="relative flex-1 text-sm leading-relaxed text-zinc-200 sm:text-[0.9375rem] sm:leading-[1.65]">
                      &ldquo;{item.quote}&rdquo;
                    </p>
                    <footer className="relative mt-5 border-t border-purple-500/15 pt-4">
                      <cite className="not-italic">
                        <span className="block text-sm font-semibold text-white">
                          {item.name}
                        </span>
                        <span className="mt-1 block text-xs font-medium text-purple-300/75">
                          {item.role}
                        </span>
                      </cite>
                    </footer>
                  </motion.article>
                ))}
              </div>
            </motion.div>
          )}

          {heroTab === "roi" && (
            <motion.div
              key="roi"
              id="hero-panel-roi"
              role="tabpanel"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.28 }}
              className="mt-8 w-full sm:mt-10"
            >
              <RoiCalculator onBookConsultation={onBookConsultation} />
            </motion.div>
          )}

          {heroTab === "services" && (
            <motion.div
              key="services"
              id="hero-panel-services"
              role="tabpanel"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.28 }}
              className="w-full"
            >
              <div className="feature-grid mt-8 w-full sm:mt-10">
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
          )}
        </AnimatePresence>
      </motion.div>
    </section>
  );
}

export const ChatHero = memo(ChatHeroInner);
