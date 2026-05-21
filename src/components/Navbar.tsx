"use client";

import type { ComponentType } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  Menu,
  Sparkles,
  LayoutDashboard,
  MessageSquare,
  Download,
  FileDown,
  Loader2,
  PanelsTopLeft,
} from "lucide-react";
import type { AiModeId } from "@/lib/ai-modes";
import { ModeSelector } from "@/components/chat/ModeSelector";
import type { AppView } from "@/types/chat";

type NavbarProps = {
  view: AppView;
  onViewChange: (view: AppView) => void;
  onBookConsultation: () => void;
  onSidebarOpen: () => void;
  onExportChat?: () => void;
  exportPdfMode?: boolean;
  exportLoading?: boolean;
  aiMode: AiModeId;
  onModeChange: (mode: AiModeId) => void;
};

function NavTab({
  active,
  onClick,
  icon: Icon,
  label,
  compact,
}: {
  active: boolean;
  onClick: () => void;
  icon: ComponentType<{ className?: string }>;
  label: string;
  compact?: boolean;
}) {
  if (active) {
    return (
      <motion.button
        type="button"
        onClick={onClick}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`flex shrink-0 items-center rounded-full bg-purple-500/30 font-semibold text-purple-50 shadow-[0_0_20px_rgba(168,85,247,0.35)] ring-1 ring-purple-400/40 ${
          compact
            ? "h-8 gap-1.5 px-3 text-xs"
            : "h-9 gap-2 px-4 text-sm lg:h-10 lg:px-5"
        }`}
      >
        <Icon className={compact ? "h-3.5 w-3.5" : "h-4 w-4"} />
        <span>{label}</span>
      </motion.button>
    );
  }

  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`flex shrink-0 items-center rounded-lg font-medium text-zinc-500 transition-colors hover:bg-white/[0.04] hover:text-zinc-200 ${
        compact
          ? "h-8 gap-1.5 px-3 text-xs"
          : "h-9 gap-2 px-3.5 text-sm lg:h-10"
      }`}
    >
      <Icon className={`opacity-50 ${compact ? "h-3.5 w-3.5" : "h-4 w-4"}`} />
      <span>{label}</span>
    </motion.button>
  );
}

export function Navbar({
  view,
  onViewChange,
  onBookConsultation,
  onSidebarOpen,
  onExportChat,
  exportPdfMode,
  exportLoading,
  aiMode,
  onModeChange,
}: NavbarProps) {
  const toggleView = () =>
    onViewChange(view === "chat" ? "dashboard" : "chat");

  return (
    <motion.header
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      className="navbar-glass relative z-30 shrink-0 border-b border-purple-500/10"
    >
      {/* Desktop: balanced 3-column grid for true center alignment */}
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
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-violet-600 shadow-[0_0_16px_rgba(168,85,247,0.4)]">
              <Sparkles className="h-[18px] w-[18px] text-white" />
            </div>
            <span className="ml-2.5 text-base font-bold tracking-tight text-white">
              Neurix AI
            </span>
          </div>

          <nav className="navbar-tabs ml-6 flex items-center">
            <NavTab
              active={view === "chat"}
              onClick={() => onViewChange("chat")}
              icon={MessageSquare}
              label="Chat"
            />
            <NavTab
              active={view === "dashboard"}
              onClick={() => onViewChange("dashboard")}
              icon={LayoutDashboard}
              label="Dashboard"
            />
          </nav>
        </div>

        <div className="flex justify-center px-4">
          <ModeSelector
            value={aiMode}
            onChange={onModeChange}
            variant="header"
          />
        </div>

        <div className="navbar-right flex items-center justify-end gap-2">
            {onExportChat && view === "chat" && (
              <button
                type="button"
                onClick={onExportChat}
                disabled={exportLoading}
                className="navbar-icon-btn"
                aria-label={exportPdfMode ? "Export PDF report" : "Export chat"}
                title={exportPdfMode ? "Export PDF report" : "Export chat"}
              >
                {exportLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin text-purple-300" />
                ) : exportPdfMode ? (
                  <FileDown className="h-5 w-5" />
                ) : (
                  <Download className="h-5 w-5" />
                )}
              </button>
            )}
            <button
              type="button"
              onClick={toggleView}
              className="navbar-icon-btn"
              aria-label={
                view === "chat" ? "Open dashboard view" : "Open chat view"
              }
              title={view === "chat" ? "Dashboard view" : "Chat view"}
            >
              <PanelsTopLeft className="h-5 w-5" />
            </button>
            <motion.button
              type="button"
              onClick={onBookConsultation}
              whileHover={{ scale: 1.03, y: -1 }}
              whileTap={{ scale: 0.97 }}
              className="consultation-cta navbar-cta ml-1 flex h-10 items-center gap-2 rounded-full bg-gradient-to-r from-purple-600 to-violet-600 px-5 text-sm font-bold text-white"
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
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-violet-600">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <span className="ml-2 truncate text-sm font-bold text-white">
                Neurix AI
              </span>
            </div>
          </div>
          <div className="navbar-right flex shrink-0 items-center gap-1">
            {onExportChat && view === "chat" && (
              <button
                type="button"
                onClick={onExportChat}
                disabled={exportLoading}
                className="navbar-icon-btn"
                aria-label={exportPdfMode ? "Export PDF report" : "Export chat"}
              >
                {exportLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin text-purple-300" />
                ) : exportPdfMode ? (
                  <FileDown className="h-5 w-5" />
                ) : (
                  <Download className="h-5 w-5" />
                )}
              </button>
            )}
            <button
              type="button"
              onClick={toggleView}
              className="navbar-icon-btn"
              aria-label="Toggle view"
            >
              <PanelsTopLeft className="h-5 w-5" />
            </button>
            <motion.button
              type="button"
              onClick={onBookConsultation}
              whileTap={{ scale: 0.97 }}
              className="consultation-cta navbar-cta flex h-8 items-center gap-1 rounded-full bg-gradient-to-r from-purple-600 to-violet-600 px-2.5 text-[11px] font-bold text-white sm:h-9 sm:gap-1.5 sm:px-3.5 sm:text-xs min-[400px]:px-4 min-[400px]:text-sm"
            >
              <Calendar className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
              <span className="hidden min-[400px]:inline">Schedule</span>
            </motion.button>
          </div>
        </div>

        <div className="navbar-mobile-mode-row border-t border-purple-500/10 px-3 pb-3 pt-2 sm:px-4">
          <nav className="navbar-mobile-tabs mb-2 flex items-center justify-center gap-1.5">
            <NavTab
              compact
              active={view === "chat"}
              onClick={() => onViewChange("chat")}
              icon={MessageSquare}
              label="Chat"
            />
            <NavTab
              compact
              active={view === "dashboard"}
              onClick={() => onViewChange("dashboard")}
              icon={LayoutDashboard}
              label="Dashboard"
            />
          </nav>
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
