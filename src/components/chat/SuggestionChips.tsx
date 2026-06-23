"use client";

import { motion } from "framer-motion";
import {
  Bot,
  LayoutTemplate,
  Workflow,
  FileUp,
  Zap,
  ScanText,
  Mic,
  Sparkles,
  LayoutDashboard,
  GitBranch,
  Calendar,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { DEFAULT_SUGGESTION_LABELS } from "@/lib/feature-tiles";

const ICON_BY_LABEL: Record<string, LucideIcon> = {
  "Build AI Voice Agent": Bot,
  "Create SaaS MVP": LayoutTemplate,
  "Analyze My Workflow": Workflow,
  "Upload Project PDF": FileUp,
  "Book a free consultation →": Calendar,
  "Automate My Business": Zap,
  "Design a multi-step AI agent for my team": GitBranch,
  "Map triggers and handoffs for my assistant": Workflow,
  "Compare build vs buy for custom agents": Bot,
  "Estimate timeline and cost for an AI agent MVP": Zap,
  "Outline a 90-day SaaS MVP scope": LayoutTemplate,
  "Recommend a modern stack for my SaaS idea": LayoutDashboard,
  "Draft pricing tiers and packaging": Sparkles,
  "List must-have vs nice-to-have features": LayoutTemplate,
  "Design an OCR pipeline for invoices": ScanText,
  "Improve extraction accuracy for contracts": ScanText,
  "Automate document routing after OCR": Workflow,
  "Design an inbound call flow for bookings": Mic,
  "Compare voice providers for my use case": Mic,
  "Script a phone agent for customer support": Bot,
  "Plan QA and fallback for voice AI": Zap,
  "Map my highest-ROI automation opportunities": Zap,
  "Connect CRM, email, and WhatsApp flows": Workflow,
  "Reduce manual ops with n8n-style workflows": Workflow,
  "Estimate hours saved per automation": Zap,
  "Recommend an internal ops dashboard": LayoutDashboard,
  "Design a team copilot for daily tasks": Bot,
  "Prioritize secure internal AI tools": Sparkles,
  "Plan rollout for internal AI adoption": Sparkles,
};

function iconForLabel(label: string): LucideIcon {
  return ICON_BY_LABEL[label] ?? Sparkles;
}

type SuggestionChipsProps = {
  onSelect: (text: string) => void;
  disabled?: boolean;
  labels?: string[];
};

export function SuggestionChips({
  onSelect,
  disabled,
  labels,
}: SuggestionChipsProps) {
  const items = labels ?? [...DEFAULT_SUGGESTION_LABELS];

  return (
    <div className="chip-scroll flex flex-nowrap items-center justify-start gap-2 overflow-x-auto pb-0.5 sm:flex-wrap sm:justify-center sm:gap-3 sm:overflow-visible sm:pb-0">
      {items.map((label, i) => {
        const Icon = iconForLabel(label);
        return (
          <motion.button
            key={label}
            type="button"
            disabled={disabled}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04, duration: 0.3 }}
            whileHover={
              disabled
                ? undefined
                : {
                    scale: 1.03,
                    y: -2,
                    boxShadow: "0 0 24px rgba(168,85,247,0.35)",
                  }
            }
            whileTap={disabled ? undefined : { scale: 0.98 }}
            onClick={() => onSelect(label)}
            className="suggestion-chip flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full border border-purple-500/30 bg-black/40 px-3 py-2 text-xs font-medium text-zinc-200 backdrop-blur-sm transition-all duration-200 hover:border-purple-400/50 hover:bg-purple-500/15 disabled:cursor-not-allowed disabled:opacity-40 sm:gap-2 sm:px-5 sm:py-3 sm:text-sm"
          >
            <Icon className="h-3.5 w-3.5 text-purple-400 sm:h-4 sm:w-4" />
            <span>{label}</span>
          </motion.button>
        );
      })}
    </div>
  );
}
