"use client";

import { motion } from "framer-motion";
import { INDUSTRY_TEMPLATES } from "@/lib/templates";

type TemplateMarketplaceProps = {
  onSelect: (prompt: string) => void;
};

export function TemplateMarketplace({ onSelect }: TemplateMarketplaceProps) {
  return (
    <section className="mx-auto w-full max-w-6xl px-3 py-6 sm:px-6">
      <h3 className="mb-1 text-lg font-semibold text-white sm:text-xl">
        AI Template Marketplace
      </h3>
      <p className="mb-5 text-sm text-zinc-500">
        Quick-start prompts tailored to your industry
      </p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4">
        {INDUSTRY_TEMPLATES.map((t, i) => {
          const Icon = t.icon;
          return (
            <motion.button
              key={t.id}
              type="button"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              whileHover={{
                y: -4,
                boxShadow: "0 0 32px rgba(168,85,247,0.3)",
              }}
              onClick={() => onSelect(t.prompt)}
              className={`group relative overflow-hidden rounded-2xl border border-purple-500/30 bg-gradient-to-br ${t.gradient} p-5 text-left backdrop-blur-md transition-colors hover:border-purple-400/50`}
            >
              <div className="absolute inset-0 bg-purple-600/10 opacity-0 transition-opacity group-hover:opacity-100" />
              <Icon className="relative mb-3 h-8 w-8 text-purple-300 transition-transform group-hover:scale-110" />
              <p className="relative font-semibold text-zinc-100">{t.title}</p>
              <p className="relative mt-1 text-sm text-zinc-500">{t.description}</p>
            </motion.button>
          );
        })}
      </div>
    </section>
  );
}
