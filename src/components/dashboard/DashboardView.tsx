"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  Bot,
  FileText,
  Layers,
  BarChart3,
  Zap,
  Clock,
} from "lucide-react";
import { getAiMode, resolveAiMode } from "@/lib/ai-modes";
import { FEATURE_TILES } from "@/lib/feature-tiles";
import type { Conversation } from "@/types/chat";

type DashboardViewProps = {
  conversations: Conversation[];
  onOpenChat: () => void;
};

function getTopModeLabel(conversations: Conversation[]): string {
  const counts = new Map<string, number>();
  for (const conversation of conversations) {
    const mode = conversation.aiMode;
    counts.set(mode, (counts.get(mode) ?? 0) + 1);
  }

  let topMode = "consultant";
  let topCount = 0;
  for (const [mode, count] of counts) {
    if (count > topCount) {
      topMode = mode;
      topCount = count;
    }
  }

  return getAiMode(resolveAiMode(topMode)).label;
}

export function DashboardView({
  conversations,
  onOpenChat,
}: DashboardViewProps) {
  const totalMessages = conversations.reduce(
    (n, c) => n + c.messages.filter((m) => m.id !== "welcome").length,
    0,
  );
  const totalDocs = conversations.reduce(
    (n, c) => n + c.uploadedFiles.length,
    0,
  );
  const recent = [...conversations]
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .slice(0, 5);

  const topModeLabel = useMemo(
    () => getTopModeLabel(conversations),
    [conversations],
  );

  const lastActiveLabel = useMemo(() => {
    if (recent.length === 0) return "No activity yet";
    return new Date(recent[0].updatedAt).toLocaleString();
  }, [recent]);

  const stats = [
    { label: "Conversations", value: conversations.length, icon: Bot },
    { label: "Messages", value: totalMessages, icon: Zap },
    { label: "Documents", value: totalDocs, icon: FileText },
    { label: "Service areas", value: FEATURE_TILES.length, icon: Layers },
  ];

  const insights = [
    `Most used mode: ${topModeLabel}`,
    `Documents analyzed: ${totalDocs}`,
    `Total messages: ${totalMessages}`,
    `Last active: ${lastActiveLabel}`,
  ];

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 px-4 py-8 sm:px-8 sm:py-10 lg:max-w-7xl lg:px-10 lg:py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white sm:text-3xl">
            Neurix Command Center
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            Your AI operating system — sessions, audits & activity
          </p>
        </div>
        <motion.button
          type="button"
          whileHover={{ scale: 1.03 }}
          onClick={onOpenChat}
          className="rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-purple-900/40"
        >
          Open AI Chat
        </motion.button>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ y: -3 }}
            className="feature-card rounded-2xl border border-purple-500/25 bg-black/35 p-5"
          >
            <s.icon className="mb-3 h-6 w-6 text-purple-400" />
            <p className="text-2xl font-bold text-white">{s.value}</p>
            <p className="text-sm text-zinc-500">{s.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-panel rounded-2xl p-5"
        >
          <h3 className="mb-4 flex items-center gap-2 font-semibold text-white">
            <BarChart3 className="h-5 w-5 text-purple-400" /> Session insights
          </h3>
          <ul className="space-y-3 text-sm text-zinc-400">
            {insights.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-panel rounded-2xl p-5"
        >
          <h3 className="mb-4 flex items-center gap-2 font-semibold text-white">
            <Clock className="h-5 w-5 text-purple-400" /> Recent activity
          </h3>
          <ul className="space-y-2">
            {recent.length === 0 ? (
              <li className="rounded-lg border border-dashed border-purple-500/20 px-3 py-4 text-sm text-zinc-500">
                No conversations yet. Open AI Chat to get started.
              </li>
            ) : (
              recent.map((c) => (
                <li
                  key={c.id}
                  className="rounded-lg bg-purple-500/10 px-3 py-2 text-sm text-zinc-300"
                >
                  {c.title}
                  <span className="ml-2 text-xs text-zinc-600">
                    {new Date(c.updatedAt).toLocaleDateString()}
                  </span>
                </li>
              ))
            )}
          </ul>
        </motion.div>
      </div>
    </div>
  );
}
