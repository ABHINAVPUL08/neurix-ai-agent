"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Sparkles } from "lucide-react";

const PLANS = [
  {
    name: "Starter",
    price: "$299",
    period: "/mo",
    desc: "For founders testing AI automation",
    features: ["AI chatbot", "1 workflow", "Email support", "5k messages/mo"],
    cta: "Start Starter",
    highlight: false,
  },
  {
    name: "Growth",
    price: "$999",
    period: "/mo",
    desc: "For scaling SMBs & agencies",
    features: [
      "Voice + chat agents",
      "5 automations",
      "WhatsApp integration",
      "Priority support",
      "Unlimited messages",
    ],
    cta: "Go Growth",
    highlight: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    desc: "For large teams & custom AI systems",
    features: [
      "Dedicated architect",
      "Custom integrations",
      "SLA & security review",
      "On-prem options",
    ],
    cta: "Contact sales",
    highlight: false,
  },
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
            <div className="mb-8 flex items-start justify-between">
              <div>
                <p className="flex items-center gap-2 text-sm text-purple-300">
                  <Sparkles className="h-4 w-4" /> Neurix Pricing
                </p>
                <h2 className="mt-1 text-2xl font-bold text-white sm:text-3xl">
                  Invest in AI that ships
                </h2>
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
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
