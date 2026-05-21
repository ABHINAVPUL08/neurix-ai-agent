"use client";

import { useState, FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Calendar,
  Sparkles,
  CheckCircle2,
  Mail,
  Loader2,
} from "lucide-react";
import {
  BUDGET_RANGES,
  PROJECT_TYPES,
  type ConsultationFormData,
  openConsultationMailto,
} from "@/lib/consultation";

type ConsultationModalProps = {
  open: boolean;
  onClose: () => void;
};

const INITIAL: ConsultationFormData = {
  name: "",
  email: "",
  company: "",
  projectType: PROJECT_TYPES[0],
  budget: BUDGET_RANGES[0],
  message: "",
};

const inputClass =
  "w-full rounded-xl border border-purple-500/25 bg-black/40 px-4 py-3 text-base text-zinc-100 placeholder:text-zinc-500 transition-all focus:border-purple-400/60 focus:outline-none focus:shadow-[0_0_24px_rgba(168,85,247,0.2)]";

const labelClass = "mb-1.5 block text-sm font-semibold text-zinc-300";

export function ConsultationModal({ open, onClose }: ConsultationModalProps) {
  const [form, setForm] = useState<ConsultationFormData>(INITIAL);
  const [status, setStatus] = useState<"form" | "submitting" | "success">("form");
  const [error, setError] = useState<string | null>(null);

  const update = (patch: Partial<ConsultationFormData>) =>
    setForm((f) => ({ ...f, ...patch }));

  const handleClose = () => {
    onClose();
    window.setTimeout(() => {
      setStatus("form");
      setForm(INITIAL);
      setError(null);
    }, 300);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setStatus("submitting");

    try {
      const res = await fetch("/api/consultation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Please check your details and try again.");
        setStatus("form");
        return;
      }

      if (data.mailto) {
        openConsultationMailto(form);
      }

      setStatus("success");
    } catch {
      openConsultationMailto(form);
      setStatus("success");
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/75 backdrop-blur-md"
            onClick={handleClose}
          />
          <motion.div
            role="dialog"
            aria-labelledby="consultation-title"
            initial={{ opacity: 0, scale: 0.94, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 16 }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            className="consultation-modal fixed left-1/2 top-1/2 z-[101] flex max-h-[92vh] w-[calc(100%-1.5rem)] max-w-xl -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-2xl sm:rounded-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-purple-500/20 px-5 py-5 sm:px-7">
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 shadow-[0_0_28px_rgba(168,85,247,0.4)]">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2
                    id="consultation-title"
                    className="text-xl font-bold text-white sm:text-2xl"
                  >
                    Schedule Consultation
                  </h2>
                  <p className="mt-1 text-sm text-zinc-400 sm:text-base">
                    Talk to AI experts · Discuss your project
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="rounded-xl p-2 text-zinc-400 transition-colors hover:bg-purple-500/15 hover:text-white"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-7 sm:py-6">
              <AnimatePresence mode="wait">
                {status === "success" ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center py-8 text-center"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 18 }}
                    >
                      <CheckCircle2 className="h-20 w-20 text-green-400 drop-shadow-[0_0_24px_rgba(74,222,128,0.45)]" />
                    </motion.div>
                    <h3 className="mt-6 text-2xl font-bold text-white">
                      Thank you!
                    </h3>
                    <p className="mt-3 max-w-sm text-base leading-relaxed text-zinc-400">
                      Your consultation request has been received. Our team at
                      Neurix will reach out shortly to discuss your project.
                    </p>
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={handleClose}
                      className="mt-8 rounded-xl bg-purple-500/20 px-6 py-3 text-base font-semibold text-purple-100 ring-1 ring-purple-400/40"
                    >
                      Back to Neurix
                    </motion.button>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onSubmit={handleSubmit}
                    className="space-y-4"
                  >
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className={labelClass} htmlFor="c-name">
                          Name <span className="text-purple-400">*</span>
                        </label>
                        <input
                          id="c-name"
                          required
                          value={form.name}
                          onChange={(e) => update({ name: e.target.value })}
                          className={inputClass}
                          placeholder="Your name"
                        />
                      </div>
                      <div>
                        <label className={labelClass} htmlFor="c-email">
                          Email <span className="text-purple-400">*</span>
                        </label>
                        <input
                          id="c-email"
                          type="email"
                          required
                          value={form.email}
                          onChange={(e) => update({ email: e.target.value })}
                          className={inputClass}
                          placeholder="you@company.com"
                        />
                      </div>
                    </div>

                    <div>
                      <label className={labelClass} htmlFor="c-company">
                        Company
                      </label>
                      <input
                        id="c-company"
                        value={form.company}
                        onChange={(e) => update({ company: e.target.value })}
                        className={inputClass}
                        placeholder="Company or startup name"
                      />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className={labelClass} htmlFor="c-type">
                          Project type <span className="text-purple-400">*</span>
                        </label>
                        <select
                          id="c-type"
                          required
                          value={form.projectType}
                          onChange={(e) =>
                            update({ projectType: e.target.value })
                          }
                          className={`${inputClass} appearance-none`}
                        >
                          {PROJECT_TYPES.map((t) => (
                            <option key={t} value={t} className="bg-zinc-900">
                              {t}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className={labelClass} htmlFor="c-budget">
                          Budget <span className="text-purple-400">*</span>
                        </label>
                        <select
                          id="c-budget"
                          required
                          value={form.budget}
                          onChange={(e) => update({ budget: e.target.value })}
                          className={`${inputClass} appearance-none`}
                        >
                          {BUDGET_RANGES.map((b) => (
                            <option key={b} value={b} className="bg-zinc-900">
                              {b}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className={labelClass} htmlFor="c-message">
                        Message <span className="text-purple-400">*</span>
                      </label>
                      <textarea
                        id="c-message"
                        required
                        rows={4}
                        value={form.message}
                        onChange={(e) => update({ message: e.target.value })}
                        className={`${inputClass} resize-none`}
                        placeholder="Tell us about your goals, timeline, and what you'd like Neurix to build…"
                      />
                    </div>

                    {error && (
                      <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">
                        {error}
                      </p>
                    )}

                    <motion.button
                      type="submit"
                      disabled={status === "submitting"}
                      whileHover={{ scale: status === "submitting" ? 1 : 1.02 }}
                      whileTap={{ scale: status === "submitting" ? 1 : 0.98 }}
                      className="consultation-submit flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 py-4 text-base font-bold text-white shadow-xl shadow-purple-600/40 disabled:opacity-70"
                    >
                      {status === "submitting" ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          Sending…
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-5 w-5" />
                          Submit consultation request
                        </>
                      )}
                    </motion.button>

                    <button
                      type="button"
                      onClick={() => openConsultationMailto(form)}
                      className="flex w-full items-center justify-center gap-2 py-2 text-sm font-medium text-zinc-500 transition-colors hover:text-purple-300"
                    >
                      <Mail className="h-4 w-4" />
                      Or open in your email app
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
