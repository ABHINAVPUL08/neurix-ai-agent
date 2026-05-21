"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Briefcase,
  AlertTriangle,
  Sparkles,
  TrendingUp,
  CheckCircle2,
  Rocket,
  LineChart,
  Code2,
  ChevronDown,
  FileSearch,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ExportReportButton } from "@/components/chat/ExportReportButton";
import { MessageMarkdown } from "@/components/chat/MessageMarkdown";
import {
  extractBulletItems,
  parseDocumentAnalysis,
  type DocumentAnalysisSection,
} from "@/lib/parse-document-analysis";

type SectionMeta = {
  icon: LucideIcon;
  accent: string;
  cardClass?: string;
};

const SECTION_META: Record<string, SectionMeta> = {
  "business-summary": {
    icon: Briefcase,
    accent: "from-purple-600/30 to-violet-900/20",
  },
  "key-business-problems": {
    icon: AlertTriangle,
    accent: "from-amber-600/20 to-purple-900/15",
    cardClass: "problem-card",
  },
  "ai-solutions-suggested": {
    icon: Sparkles,
    accent: "from-violet-600/25 to-purple-900/15",
    cardClass: "solution-card",
  },
  "expected-business-impact": {
    icon: TrendingUp,
    accent: "from-emerald-600/20 to-purple-900/15",
  },
  "recommended-features": {
    icon: CheckCircle2,
    accent: "from-purple-600/25 to-black/30",
  },
  "recommended-mvp": {
    icon: Rocket,
    accent: "from-indigo-600/25 to-purple-900/15",
  },
  "growth-opportunities": {
    icon: LineChart,
    accent: "from-fuchsia-600/20 to-purple-900/15",
  },
  "advanced-technical-architecture": {
    icon: Code2,
    accent: "from-zinc-700/30 to-black/40",
  },
};

const SECTION_ORDER = [
  "business-summary",
  "key-business-problems",
  "ai-solutions-suggested",
  "expected-business-impact",
  "recommended-features",
  "recommended-mvp",
  "growth-opportunities",
  "advanced-technical-architecture",
];

function sortSections(sections: DocumentAnalysisSection[]) {
  return [...sections].sort((a, b) => {
    const ai = SECTION_ORDER.indexOf(a.slug);
    const bi = SECTION_ORDER.indexOf(b.slug);
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });
}

function BulletCards({
  items,
  variant,
}: {
  items: string[];
  variant: "problem" | "solution" | "impact";
}) {
  return (
    <div className="report-bullet-grid">
      {items.map((item, i) => (
        <motion.div
          key={`${variant}-${i}-${item.slice(0, 24)}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.04, duration: 0.35 }}
          className={`report-mini-card report-mini-card--${variant}`}
        >
          <span className="report-mini-card__dot" aria-hidden />
          <p>{item}</p>
        </motion.div>
      ))}
    </div>
  );
}

function CollapsibleTechSection({ body }: { body: string }) {
  const [open, setOpen] = useState(false);
  const items = extractBulletItems(body);

  return (
    <div className="report-tech-collapsible">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="report-tech-toggle"
        aria-expanded={open}
      >
        <Code2 className="h-4 w-4 text-purple-300" />
        <span>Advanced Technical Architecture</span>
        <span className="text-xs font-normal text-zinc-500">
          (optional — for technical teams)
        </span>
        <ChevronDown
          className={`ml-auto h-5 w-5 text-purple-300 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="report-tech-body">
              {items.length > 0 ? (
                <ul className="space-y-2 text-sm text-zinc-400">
                  {items.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-purple-400" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <MessageMarkdown content={body} className="text-sm" />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ReportSectionBlock({
  section,
  index,
  isStreaming,
}: {
  section: DocumentAnalysisSection;
  index: number;
  isStreaming?: boolean;
}) {
  const meta = SECTION_META[section.slug] ?? {
    icon: Zap,
    accent: "from-purple-600/20 to-black/30",
  };
  const Icon = meta.icon;
  const bullets = extractBulletItems(section.body);

  const useProblemCards = section.slug === "key-business-problems";
  const useSolutionCards =
    section.slug === "ai-solutions-suggested" ||
    section.slug === "recommended-features";
  const useImpactCards = section.slug === "expected-business-impact";
  const isTech = section.slug === "advanced-technical-architecture";

  if (isTech) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.06, duration: 0.4 }}
      >
        <CollapsibleTechSection body={section.body} />
      </motion.div>
    );
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.45 }}
      className={`report-section-card bg-gradient-to-br ${meta.accent}`}
    >
      <div className="report-section-card__header">
        <div className="report-section-card__icon">
          <Icon className="h-5 w-5 text-purple-200" />
        </div>
        <h3 className="report-section-card__title">{section.title}</h3>
      </div>

      <div className="report-section-card__body">
        {section.slug === "business-summary" ? (
          <MessageMarkdown content={section.body} className="text-[15px]" />
        ) : useProblemCards && bullets.length > 0 ? (
          <BulletCards items={bullets} variant="problem" />
        ) : useSolutionCards && bullets.length > 0 ? (
          <BulletCards items={bullets} variant="solution" />
        ) : useImpactCards && bullets.length > 0 ? (
          <BulletCards items={bullets} variant="impact" />
        ) : bullets.length > 0 ? (
          <BulletCards items={bullets} variant="solution" />
        ) : (
          <MessageMarkdown content={section.body} className="text-sm" />
        )}
      </div>

      {isStreaming && index === 0 && (
        <motion.span
          className="stream-cursor ml-1 inline-block h-4 w-0.5 bg-purple-400"
          animate={{ opacity: [1, 0.2, 1] }}
          transition={{ duration: 0.75, repeat: Infinity }}
          aria-hidden
        />
      )}
    </motion.section>
  );
}

type DocumentAnalysisReportProps = {
  content: string;
  isStreaming?: boolean;
  truncatedNote?: boolean;
  projectName?: string;
  sourceFilename?: string;
};

export function DocumentAnalysisReport({
  content,
  isStreaming,
  truncatedNote,
  projectName,
  sourceFilename,
}: DocumentAnalysisReportProps) {
  const { preamble, sections, isReport } = parseDocumentAnalysis(content);
  const sorted = sortSections(sections);

  if (!isReport || sorted.length === 0) {
    return <MessageMarkdown content={content} className="text-base" />;
  }

  return (
    <article className="consultant-report w-full">
      <motion.header
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="consultant-report__header"
      >
        <div className="consultant-report__badge">
          <FileSearch className="h-4 w-4" />
          <span>AI Business Audit</span>
        </div>
        <p className="consultant-report__subtitle">
          Strategic analysis prepared by your Neurix AI consultant
        </p>
        {truncatedNote && (
          <p className="consultant-report__notice">
            Based on an excerpt of your document — upload the full file for
            deeper insights.
          </p>
        )}
      </motion.header>

      {preamble && !preamble.startsWith("_") && (
        <p className="consultant-report__preamble text-sm text-zinc-500">
          {preamble.replace(/^>?\s*\*\*Note:\*\*[^\n]*\n?/i, "").trim()}
        </p>
      )}

      <div className="consultant-report__sections">
        {sorted.map((section, i) => (
          <ReportSectionBlock
            key={section.slug}
            section={section}
            index={i}
            isStreaming={isStreaming && i === sorted.length - 1}
          />
        ))}
      </div>

      {!isStreaming && (
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="consultant-report__footer flex flex-col items-center gap-4"
        >
          <ExportReportButton
            analysisContent={content}
            projectName={projectName}
            sourceFilename={sourceFilename}
          />
          <p className="text-center text-sm text-zinc-500">
            Ready for a custom roadmap? Schedule a consultation to turn these
            insights into an implementation plan.
          </p>
        </motion.footer>
      )}
    </article>
  );
}
