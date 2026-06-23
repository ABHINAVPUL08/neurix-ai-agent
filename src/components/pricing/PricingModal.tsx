"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Sparkles } from "lucide-react";

const PLANS = [
  {
    name: "Starter",
    price: "$300",
    period: "– $1K",
    desc: "Launch your first AI — chatbot + one workflow",
    features: [
      "AI website chatbot",
      "1 automation workflow",
      "Setup & email support",
      "Ideal for founders testing AI",
    ],
    cta: "Get Starter quote",
    highlight: false,
  },
  {
    name: "Growth",
    price: "$1K",
    period: "– $8K",
    desc: "Scale with voice, OCR, WhatsApp & CRM flows",
    features: [
      "Voice AI or OCR pipeline",
      "WhatsApp + CRM integration",
      "3–5 automations",
      "Priority support & handoff",
    ],
    cta: "Get Growth quote",
    highlight: true,
  },
  {
    name: "Enterprise",
    price: "$15K",
    period: "+",
    desc: "Custom SaaS, platforms & enterprise AI systems",
    features: [
      "SaaS MVP or full product build",
      "Dedicated AI architect",
      "Custom integrations + SLA",
      "Security review & on-prem options",
    ],
    cta: "Contact sales",
    highlight: false,
  },
] as const;

const A_LA_CARTE = [
  "Voice AI agent — from $2K",
  "OCR / document pipeline — from $1K",
  "SaaS MVP — from $3K",
  "Automation workflow — from $1K",
] as const;

type PricingModalProps = {
  open: boolean;
  onClose: () => void;
  onBook: () => void;
};

export function PricingModal({ open, onClose, onBook }: PricingModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/75 backdrop-blur-md"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            className="glass-premium fixed left-1/2 top-1/2 z-[101] max-h-[90vh] w-[calc(100%-1.5rem)] max-w-5xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-3xl p-6 sm:p-8"
          >
            <div className="mb-6 flex items-start justify-between sm:mb-8">
              <div>
                <p className="flex items-center gap-2 text-sm text-purple-300">
                  <Sparkles className="h-4 w-4" /> Neurix Pricing
                </p>
                <h2 className="mt-1 text-2xl font-bold text-white sm:text-3xl">
                  Invest in AI that ships
                </h2>
                <p className="mt-2 max-w-xl text-sm text-zinc-500">
                  Project-based pricing — final quote after your free consultation.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-800/50"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {PLANS.map((plan, i) => (
                <motion.div
                  key={plan.name}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  whileHover={{ y: -4 }}
                  className={`rounded-2xl border p-6 ${
                    plan.highlight
                      ? "border-purple-400/60 bg-purple-500/15 shadow-[0_0_40px_rgba(168,85,247,0.25)]"
                      : "border-purple-500/25 bg-black/30"
                  }`}
                >
                  {plan.highlight && (
                    <span className="mb-3 inline-block rounded-full bg-purple-500/30 px-3 py-0.5 text-xs font-semibold text-purple-100">
                      Most popular
                    </span>
                  )}
                  <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                  <p className="mt-2 text-3xl font-bold text-purple-200">
                    {plan.price}
                    <span className="text-base font-normal text-zinc-500">
                      {plan.period}
                    </span>
                  </p>
                  <p className="mt-2 text-sm text-zinc-500">{plan.desc}</p>
                  <ul className="mt-5 space-y-2">
                    {plan.features.map((f) => (
                      <li
                        key={f}
                        className="flex items-center gap-2 text-sm text-zinc-300"
                      >
                        <Check className="h-4 w-4 shrink-0 text-purple-400" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={onBook}
                    className={`mt-6 w-full rounded-xl py-3 text-sm font-semibold ${
                      plan.highlight
                        ? "bg-gradient-to-r from-purple-600 to-violet-600 text-white shadow-lg shadow-purple-900/40"
                        : "border border-purple-500/40 bg-purple-500/10 text-purple-100"
                    }`}
                  >
                    {plan.cta}
                  </motion.button>
                </motion.div>
              ))}
            </div>
            <div className="mt-6 rounded-2xl border border-purple-500/20 bg-black/25 px-5 py-4 sm:mt-8">
              <p className="text-xs font-semibold uppercase tracking-wide text-purple-300">
                À la carte services
              </p>
              <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm text-zinc-400">
                {A_LA_CARTE.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
