"use client";

import type { ComponentType } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  MessageSquare,
  FileText,
  LayoutTemplate,
  Settings,
  X,
  Sparkles,
  Trash2,
  LayoutDashboard,
  Calendar,
} from "lucide-react";
import { ModeSelector } from "@/components/chat/ModeSelector";
import { INDUSTRY_TEMPLATES } from "@/lib/templates";
import type { AiModeId } from "@/lib/ai-modes";
import type { Conversation } from "@/types/chat";

type SidebarProps = {
  open: boolean;
  onClose: () => void;
  onNewChat: () => void;
  conversations: Conversation[];
  activeId: string | null;
  onSelectChat: (id: string) => void;
  onDeleteChat: (id: string) => void;
  onOpenDashboard: () => void;
  onBookConsultation?: () => void;
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

export function Sidebar({
  open,
  onClose,
  onNewChat,
  conversations,
  activeId,
  onSelectChat,
  onDeleteChat,
  onOpenDashboard,
  onBookConsultation,
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
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 shadow-[0_0_28px_rgba(168,85,247,0.4)]">
                    <Sparkles className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-xl font-bold tracking-tight text-white">
                    Neurix
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
                  onOpenDashboard();
                  onClose();
                }}
                className="sidebar-nav-btn mb-2 flex w-full items-center gap-3 rounded-xl px-4 py-3.5 text-base font-medium text-zinc-300 transition-all hover:bg-purple-500/12 hover:text-white"
              >
                <LayoutDashboard className="h-5 w-5 text-purple-400" />
                Dashboard
              </button>

              {onBookConsultation && (
                <motion.button
                  type="button"
                  onClick={() => {
                    onBookConsultation();
                    onClose();
                  }}
                  whileHover={{ scale: 1.01 }}
                  className="mb-6 flex w-full items-center gap-3 rounded-xl border border-purple-500/25 bg-purple-500/10 px-4 py-3.5 text-base font-semibold text-purple-100 transition-all hover:border-purple-400/40 hover:bg-purple-500/18"
                >
                  <Calendar className="h-5 w-5 text-purple-300" />
                  Schedule consultation
                </motion.button>
              )}

              <nav className="sidebar-scroll flex flex-1 flex-col gap-7 overflow-y-auto pr-1">
                <section>
                  <SectionHeading icon={MessageSquare}>Chats</SectionHeading>
                  <ul className="space-y-1.5">
                    {conversations.map((c) => {
                      const isActive = c.id === activeId;
                      return (
                        <li key={c.id} className="group flex items-center gap-1">
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
                        </li>
                      );
                    })}
                  </ul>
                </section>

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
                  <SectionHeading icon={LayoutTemplate}>
                    Templates
                  </SectionHeading>
                  <ul className="max-h-48 space-y-1 overflow-y-auto">
                    {INDUSTRY_TEMPLATES.slice(0, 6).map((t) => (
                      <li key={t.id}>
                        <button
                          type="button"
                          onClick={() => handleTemplate(t.prompt)}
                          className="sidebar-template-btn w-full rounded-xl px-4 py-3 text-left text-sm font-medium leading-snug text-zinc-300 transition-all hover:bg-purple-500/12 hover:text-purple-50"
                        >
                          {t.title}
                        </button>
                      </li>
                    ))}
                  </ul>
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
