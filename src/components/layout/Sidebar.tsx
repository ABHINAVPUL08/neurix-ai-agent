"use client";

import type { ComponentType } from "react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  MessageSquare,
  FileText,
  LayoutTemplate,
  Settings,
  X,
  Trash2,
  LayoutDashboard,
  CalendarClock,
  Tag,
  Download,
  FileDown,
  Volume2,
  VolumeX,
  Loader2,
  ChevronDown,
} from "lucide-react";
import { NeurixLogo } from "@/components/brand/NeurixLogo";
import { ModeSelector } from "@/components/chat/ModeSelector";
import { INDUSTRY_TEMPLATES } from "@/lib/templates";
import type { AiModeId } from "@/lib/ai-modes";
import type { AppView, Conversation } from "@/types/chat";

type SidebarProps = {
  open: boolean;
  onClose: () => void;
  onNewChat: () => void;
  conversations: Conversation[];
  activeId: string | null;
  onSelectChat: (id: string) => void;
  onDeleteChat: (id: string) => void;
  onOpenDashboard: () => void;
  onOpenChat: () => void;
  view: AppView;
  onBookCall?: () => void;
  onOpenPricing?: () => void;
  onExportChat?: () => void;
  exportPdfMode?: boolean;
  exportLoading?: boolean;
  voiceMuted?: boolean;
  onToggleVoiceMuted?: () => void;
  aiMode: AiModeId;
  onModeChange: (mode: AiModeId) => void;
  onTemplateSelect: (text: string) => void;
};

function SectionHeading({
  icon: Icon,
  children,
}: {
  icon: ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <p className="sidebar-section-heading mb-3 flex items-center gap-2.5 text-sm font-bold uppercase tracking-widest text-zinc-400">
      <Icon className="h-5 w-5 shrink-0 text-purple-400" />
      {children}
    </p>
  );
}

function SidebarAction({
  icon: Icon,
  label,
  onClick,
  disabled,
  loading,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      className="sidebar-nav-btn flex w-full items-center gap-3 rounded-xl px-4 py-3.5 text-base font-medium text-zinc-300 transition-all hover:bg-purple-500/12 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
    >
      {loading ? (
        <Loader2 className="h-5 w-5 shrink-0 animate-spin text-purple-400" />
      ) : (
        <Icon className="h-5 w-5 shrink-0 text-purple-400" />
      )}
      {label}
    </button>
  );
}

function SidebarExpandSection({
  icon: Icon,
  label,
  children,
  defaultOpen = false,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [pinnedOpen, setPinnedOpen] = useState(defaultOpen);

  return (
    <section className="sidebar-expand-section group mb-6 rounded-2xl border border-purple-500/20 bg-purple-950/20 p-3">
      <button
        type="button"
        onClick={() => setPinnedOpen((open) => !open)}
        className="sidebar-section-trigger flex w-full items-center gap-2.5 rounded-lg px-1 py-1 text-left text-xs font-bold uppercase tracking-widest text-purple-300/80 transition-colors hover:text-purple-100"
        aria-expanded={pinnedOpen}
      >
        <Icon className="h-5 w-5 shrink-0 text-purple-400" />
        {label}
        <ChevronDown
          className={`ml-auto h-4 w-4 shrink-0 text-purple-400/80 transition-transform duration-200 ${
            pinnedOpen ? "rotate-180" : "group-hover:rotate-180"
          }`}
        />
      </button>
      <div
        className={`sidebar-expand-panel space-y-1.5 ${
          pinnedOpen ? "sidebar-expand-panel-open" : ""
        }`}
      >
        {children}
      </div>
    </section>
  );
}

export function Sidebar({
  open,
  onClose,
  onNewChat,
  conversations,
  activeId,
  onSelectChat,
  onDeleteChat,
  onOpenDashboard,
  onOpenChat,
  view,
  onBookCall,
  onOpenPricing,
  onExportChat,
  exportPdfMode,
  exportLoading,
  voiceMuted = false,
  onToggleVoiceMuted,
  aiMode,
  onModeChange,
  onTemplateSelect,
}: SidebarProps) {
  const handleSelect = (id: string) => {
    onSelectChat(id);
    onClose();
  };

  const handleTemplate = (text: string) => {
    onTemplateSelect(text);
    onClose();
  };

  const fileCount = conversations.reduce(
    (n, c) => n + c.uploadedFiles.length,
    0,
  );

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-md"
            onClick={onClose}
          />
          <motion.aside
            key="sidebar"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 420, damping: 38 }}
            drag="x"
            dragConstraints={{ left: -320, right: 0 }}
            dragElastic={0.05}
            onDragEnd={(_, info) => {
              if (info.offset.x < -80) onClose();
            }}
            className="glass-premium fixed left-0 top-0 z-[70] flex h-full w-[min(320px,90vw)] flex-col overflow-hidden border-r border-purple-500/30 shadow-[4px_0_48px_rgba(0,0,0,0.5)]"
          >
            <div className="flex h-full flex-col px-5 py-6 sm:px-6">
              <div className="mb-8 flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <NeurixLogo size="lg" glow />
                  <span className="text-xl font-bold tracking-tight text-white">
                    Neurix Solution
                  </span>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl p-2.5 text-zinc-400 transition-all hover:bg-purple-500/15 hover:text-white"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <motion.button
                type="button"
                onClick={() => {
                  onNewChat();
                  onClose();
                }}
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                className="sidebar-primary-btn mb-3 flex w-full items-center justify-center gap-2.5 rounded-xl border border-purple-400/50 bg-purple-500/25 py-4 text-base font-bold text-purple-50 shadow-[0_0_24px_rgba(168,85,247,0.2)] transition-shadow hover:shadow-[0_0_32px_rgba(168,85,247,0.35)]"
              >
                <Plus className="h-5 w-5" />
                New chat
              </motion.button>

              <button
                type="button"
                onClick={() => {
                  onOpenChat();
                  onClose();
                }}
                className={`sidebar-nav-btn mb-2 flex w-full items-center gap-3 rounded-xl px-4 py-3.5 text-base font-medium transition-all ${
                  view === "chat"
                    ? "bg-purple-500/20 text-white ring-1 ring-purple-400/35"
                    : "text-zinc-300 hover:bg-purple-500/12 hover:text-white"
                }`}
              >
                <MessageSquare className="h-5 w-5 text-purple-400" />
                Chat
              </button>

              <button
                type="button"
                onClick={() => {
                  onOpenDashboard();
                  onClose();
                }}
                className={`sidebar-nav-btn mb-4 flex w-full items-center gap-3 rounded-xl px-4 py-3.5 text-base font-medium transition-all ${
                  view === "dashboard"
                    ? "bg-purple-500/20 text-white ring-1 ring-purple-400/35"
                    : "text-zinc-300 hover:bg-purple-500/12 hover:text-white"
                }`}
              >
                <LayoutDashboard className="h-5 w-5 text-purple-400" />
                Dashboard
              </button>

              <section className="mb-6 rounded-2xl border border-purple-500/20 bg-purple-950/20 p-3">
                <p className="sidebar-section-heading mb-2 px-1 text-xs font-bold uppercase tracking-widest text-purple-300/80">
                  Quick actions
                </p>
                <div className="space-y-1">
                  {onBookCall && (
                    <SidebarAction
                      icon={CalendarClock}
                      label="Book a call"
                      onClick={() => {
                        onBookCall();
                        onClose();
                      }}
                    />
                  )}
                  {onOpenPricing && (
                    <SidebarAction
                      icon={Tag}
                      label="Pricing"
                      onClick={() => {
                        onOpenPricing();
                        onClose();
                      }}
                    />
                  )}
                  {onExportChat && view === "chat" && (
                    <SidebarAction
                      icon={exportPdfMode ? FileDown : Download}
                      label={exportPdfMode ? "Export PDF report" : "Export chat"}
                      onClick={() => {
                        onExportChat();
                        onClose();
                      }}
                      loading={exportLoading}
                    />
                  )}
                  {onToggleVoiceMuted && view === "chat" && (
                    <button
                      type="button"
                      onClick={onToggleVoiceMuted}
                      className="sidebar-nav-btn flex w-full items-center gap-3 rounded-xl px-4 py-3.5 text-base font-medium text-zinc-300 transition-all hover:bg-purple-500/12 hover:text-white"
                    >
                      {voiceMuted ? (
                        <VolumeX className="h-5 w-5 shrink-0 text-purple-400" />
                      ) : (
                        <Volume2 className="h-5 w-5 shrink-0 text-purple-400" />
                      )}
                      {voiceMuted ? "Unmute AI voice" : "Mute AI voice"}
                    </button>
                  )}
                </div>
              </section>

              <SidebarExpandSection icon={MessageSquare} label="Chats">
                {conversations.map((c) => {
                  const isActive = c.id === activeId;
                  return (
                    <div
                      key={c.id}
                      className="group flex items-center gap-1"
                    >
                      <motion.button
                        type="button"
                        onClick={() => handleSelect(c.id)}
                        whileHover={{ x: 2 }}
                        className={`sidebar-chat-item min-w-0 flex-1 truncate rounded-xl px-4 py-3 text-left text-base font-medium transition-all ${
                          isActive
                            ? "sidebar-item-active bg-purple-500/30 text-white ring-1 ring-purple-400/45 shadow-[0_0_20px_rgba(168,85,247,0.25)]"
                            : "text-zinc-300 hover:bg-purple-500/12 hover:text-white"
                        }`}
                      >
                        {c.title}
                      </motion.button>
                      {conversations.length > 1 && (
                        <button
                          type="button"
                          onClick={() => onDeleteChat(c.id)}
                          className="rounded-lg p-2 text-zinc-500 opacity-0 transition-all hover:bg-red-500/15 hover:text-red-400 group-hover:opacity-100"
                          aria-label="Delete chat"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </SidebarExpandSection>

              <SidebarExpandSection icon={LayoutTemplate} label="Templates">
                {INDUSTRY_TEMPLATES.slice(0, 6).map((t) => {
                  const TemplateIcon = t.icon;
                  return (
                    <SidebarAction
                      key={t.id}
                      icon={TemplateIcon}
                      label={t.title}
                      onClick={() => handleTemplate(t.prompt)}
                    />
                  );
                })}
              </SidebarExpandSection>

              <nav className="sidebar-scroll flex flex-1 flex-col gap-7 overflow-y-auto pr-1">
                <section>
                  <SectionHeading icon={FileText}>Files</SectionHeading>
                  <p className="px-1 text-base leading-relaxed text-zinc-400">
                    <span className="font-semibold text-zinc-200">
                      {fileCount}
                    </span>{" "}
                    uploaded across sessions
                  </p>
                </section>

                <section>
                  <SectionHeading icon={Settings}>Settings</SectionHeading>
                  <ModeSelector value={aiMode} onChange={onModeChange} compact />
                </section>
              </nav>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
