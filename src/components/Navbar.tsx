"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { Calendar, Menu } from "lucide-react";
import type { AiModeId } from "@/lib/ai-modes";
import { ModeSelector } from "@/components/chat/ModeSelector";
import { NeurixLogo } from "@/components/brand/NeurixLogo";

type NavbarProps = {
  onBookConsultation: () => void;
  onSidebarOpen: () => void;
  aiMode: AiModeId;
  onModeChange: (mode: AiModeId) => void;
};

function NavbarInner({
  onBookConsultation,
  onSidebarOpen,
  aiMode,
  onModeChange,
}: NavbarProps) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      className="navbar-glass relative z-30 shrink-0 border-b border-purple-500/10"
    >
      {/* Desktop */}
      <div className="navbar-grid hidden h-[4.25rem] grid-cols-[1fr_auto_1fr] items-center gap-4 px-6 lg:grid xl:h-[4.5rem] xl:px-10">
        <div className="navbar-left flex min-w-0 items-center">
          <motion.button
            type="button"
            onClick={onSidebarOpen}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className="navbar-menu-btn flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-purple-500/25 bg-purple-500/10 text-purple-200"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </motion.button>

          <div className="navbar-brand ml-4 flex items-center">
            <NeurixLogo size="md" />
            <span className="ml-2.5 text-base font-bold tracking-tight text-white">
              Neurix Solution
            </span>
          </div>
        </div>

        <div className="flex justify-center px-4">
          <ModeSelector
            value={aiMode}
            onChange={onModeChange}
            variant="header"
          />
        </div>

        <div className="navbar-right flex items-center justify-end">
          <motion.button
            type="button"
            onClick={onBookConsultation}
            whileHover={{ scale: 1.03, y: -1 }}
            whileTap={{ scale: 0.97 }}
            className="consultation-cta navbar-cta flex h-10 items-center gap-2 rounded-full bg-gradient-to-r from-purple-600 to-violet-600 px-5 text-sm font-bold text-white shadow-lg shadow-purple-900/30"
          >
            <Calendar className="h-4 w-4 shrink-0" />
            <span>Schedule Consultation</span>
          </motion.button>
        </div>
      </div>

      {/* Mobile / tablet */}
      <div className="lg:hidden">
        <div className="navbar-mobile-top flex h-12 min-w-0 items-center justify-between gap-2 px-3 sm:h-[3.25rem] sm:gap-2.5 sm:px-4">
          <div className="navbar-left flex min-w-0 flex-1 items-center gap-2">
            <motion.button
              type="button"
              onClick={onSidebarOpen}
              whileTap={{ scale: 0.96 }}
              className="navbar-menu-btn flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-purple-500/25 bg-purple-500/10 text-purple-200 sm:h-10 sm:w-10"
              aria-label="Open menu"
            >
              <Menu className="h-[18px] w-[18px] sm:h-5 sm:w-5" />
            </motion.button>
            <div className="navbar-brand flex min-w-0 items-center">
              <NeurixLogo size="sm" />
              <span className="ml-2 truncate text-sm font-bold text-white">
                Neurix Solution
              </span>
            </div>
          </div>
          <div className="navbar-right flex shrink-0 items-center">
            <motion.button
              type="button"
              onClick={onBookConsultation}
              whileTap={{ scale: 0.97 }}
              className="consultation-cta navbar-cta flex h-8 items-center gap-1.5 rounded-full bg-gradient-to-r from-purple-600 to-violet-600 px-3 text-[11px] font-bold text-white sm:h-9 sm:px-4 sm:text-sm"
            >
              <Calendar className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
              <span className="hidden min-[380px]:inline">Schedule</span>
              <span className="min-[380px]:hidden">Book</span>
            </motion.button>
          </div>
        </div>

        <div className="navbar-mobile-mode-row border-t border-purple-500/10 px-3 pb-3 pt-2 sm:px-4">
          <div className="flex w-full justify-center px-1">
            <ModeSelector
              value={aiMode}
              onChange={onModeChange}
              variant="header"
            />
          </div>
        </div>
      </div>
    </motion.header>
  );
}

export const Navbar = memo(NavbarInner);
