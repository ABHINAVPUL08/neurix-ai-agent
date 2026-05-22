"use client";

import { useRef, useState, type FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, MessageSquare } from "lucide-react";
import {
  FEEDBACK_CATEGORIES,
  FEEDBACK_ERROR_MESSAGE,
  OTHER_CATEGORY,
  sendFeedback,
  type FeedbackCategory,
  type FeedbackFormData,
} from "@/lib/feedback";

type FeedbackModalProps = {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onError: (message: string) => void;
};

const INITIAL: FeedbackFormData = {
  message: "",
  email: "",
  categories: [],
  otherText: "",
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const inputClass =
  "w-full rounded-xl border border-purple-500/25 bg-black/40 px-4 py-3 text-base text-zinc-100 placeholder:text-zinc-500 transition-all focus:border-purple-400/60 focus:outline-none focus:shadow-[0_0_24px_rgba(168,85,247,0.2)]";

const labelClass = "mb-1.5 block text-sm font-semibold text-zinc-300";

const chipBase =
  "rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-200 sm:text-sm";

function CategoryChips({
  selected,
  disabled,
  onToggle,
}: {
  selected: FeedbackCategory[];
  disabled: boolean;
  onToggle: (category: FeedbackCategory) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Feedback categories">
      {FEEDBACK_CATEGORIES.map((category) => {
        const active = selected.includes(category);
        return (
          <motion.button
            key={category}
            type="button"
            disabled={disabled}
            onClick={() => onToggle(category)}
            whileTap={{ scale: 0.96 }}
            className={`${chipBase} ${
              active
                ? "border-purple-400/60 bg-purple-500/30 text-purple-50 shadow-[0_0_16px_rgba(168,85,247,0.25)]"
                : "border-purple-500/20 bg-black/30 text-zinc-400 hover:border-purple-400/40 hover:bg-purple-500/10 hover:text-purple-100"
            } disabled:cursor-not-allowed disabled:opacity-50`}
            aria-pressed={active}
          >
            {category}
          </motion.button>
        );
      })}
    </div>
  );
}

export function FeedbackModal({
  open,
  onClose,
  onSuccess,
  onError,
}: FeedbackModalProps) {
  const [form, setForm] = useState<FeedbackFormData>(INITIAL);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const submitLockRef = useRef(false);

  const showOtherInput = form.categories.includes(OTHER_CATEGORY);

  const update = (patch: Partial<FeedbackFormData>) =>
    setForm((f) => ({ ...f, ...patch }));

  const toggleCategory = (category: FeedbackCategory) => {
    setForm((f) => {
      const has = f.categories.includes(category);
      const categories = has
        ? f.categories.filter((c) => c !== category)
        : [...f.categories, category];
      const otherText =
        category === OTHER_CATEGORY && has ? "" : f.otherText;
      return { ...f, categories, otherText };
    });
  };

  const handleClose = () => {
    if (submitting) return;
    onClose();
    window.setTimeout(() => {
      setForm(INITIAL);
      setError(null);
      submitLockRef.current = false;
    }, 300);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (submitting || submitLockRef.current) return;

    const message = form.message.trim();
    const email = form.email.trim();
    const otherText = form.otherText.trim();

    if (form.categories.length === 0) {
      setError("Please select at least one category.");
      return;
    }
    if (showOtherInput && !otherText) {
      setError('Please specify your feedback under "Other".');
      return;
    }
    if (message.length < 3) {
      setError("Please enter at least a few characters of feedback.");
      return;
    }
    if (!email || !EMAIL_RE.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setError(null);
    setSubmitting(true);
    submitLockRef.current = true;

    try {
      await sendFeedback({
        email,
        message,
        categories: form.categories,
        otherText: showOtherInput ? otherText : undefined,
      });

      setForm(INITIAL);
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      setError(FEEDBACK_ERROR_MESSAGE);
      onError(FEEDBACK_ERROR_MESSAGE);
      submitLockRef.current = false;
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[102] cursor-default bg-black/75 backdrop-blur-md"
            aria-label="Close feedback"
            onClick={handleClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="feedback-modal-title"
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            className="glass-premium fixed left-1/2 top-1/2 z-[103] flex max-h-[92vh] w-[calc(100%-1.5rem)] max-w-md -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-2xl sm:rounded-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-purple-500/20 px-5 py-4 sm:px-6">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/25 ring-1 ring-purple-400/40">
                  <MessageSquare className="h-4 w-4 text-purple-200" />
                </div>
                <h2
                  id="feedback-modal-title"
                  className="text-lg font-bold text-zinc-50"
                >
                  Send feedback
                </h2>
              </div>
              <button
                type="button"
                onClick={handleClose}
                disabled={submitting}
                className="rounded-xl p-2 text-zinc-400 transition-colors hover:bg-purple-500/15 hover:text-white disabled:opacity-40"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="flex min-h-0 flex-1 flex-col overflow-y-auto px-5 py-4 sm:px-6 sm:py-5"
            >
              <div className="mb-4">
                <span className={labelClass}>
                  Categories <span className="text-red-400">*</span>
                </span>
                <p className="mb-2 text-xs text-zinc-500">
                  Select all that apply
                </p>
                <CategoryChips
                  selected={form.categories}
                  disabled={submitting}
                  onToggle={toggleCategory}
                />
              </div>

              <AnimatePresence>
                {showOtherInput && (
                  <motion.div
                    key="other-input"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-4 overflow-hidden"
                  >
                    <label htmlFor="feedback-other" className={labelClass}>
                      Other <span className="text-red-400">*</span>
                    </label>
                    <input
                      id="feedback-other"
                      type="text"
                      value={form.otherText}
                      onChange={(e) => update({ otherText: e.target.value })}
                      disabled={submitting}
                      required
                      placeholder="Please specify..."
                      className={inputClass}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="mb-4">
                <label htmlFor="feedback-email" className={labelClass}>
                  Email <span className="text-red-400">*</span>
                </label>
                <input
                  id="feedback-email"
                  type="email"
                  value={form.email}
                  onChange={(e) => update({ email: e.target.value })}
                  disabled={submitting}
                  required
                  placeholder="you@company.com"
                  className={inputClass}
                  autoComplete="email"
                />
              </div>

              <div className="mb-4">
                <label htmlFor="feedback-message" className={labelClass}>
                  Message <span className="text-red-400">*</span>
                </label>
                <textarea
                  id="feedback-message"
                  value={form.message}
                  onChange={(e) => update({ message: e.target.value })}
                  disabled={submitting}
                  rows={4}
                  required
                  placeholder="Describe the issue or suggestion…"
                  className={`${inputClass} min-h-[120px] resize-y`}
                />
              </div>

              {error && (
                <p className="mb-3 text-sm text-red-300" role="alert">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="mt-auto flex w-full items-center justify-center gap-2 rounded-xl border border-purple-400/50 bg-purple-500/25 py-3.5 text-base font-bold text-purple-50 shadow-[0_0_24px_rgba(168,85,247,0.2)] transition-shadow hover:shadow-[0_0_32px_rgba(168,85,247,0.35)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Sending…
                  </>
                ) : (
                  "Submit feedback"
                )}
              </button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
