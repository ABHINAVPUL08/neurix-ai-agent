"use client";

import { motion } from "framer-motion";
import { FileDown, Loader2 } from "lucide-react";
import { useAuditExport } from "@/contexts/AuditExportContext";

type ExportReportButtonProps = {
  analysisContent: string;
  projectName?: string;
  sourceFilename?: string;
  disabled?: boolean;
  variant?: "primary" | "compact";
};

export function ExportReportButton({
  analysisContent,
  projectName,
  sourceFilename,
  disabled,
  variant = "primary",
}: ExportReportButtonProps) {
  const { isExporting, exportReport } = useAuditExport();

  const handleExport = () => {
    if (isExporting || disabled || !analysisContent.trim()) return;
    void exportReport({
      analysisContent,
      projectName,
      sourceFilename,
    });
  };

  if (variant === "compact") {
    return (
      <button
        type="button"
        onClick={handleExport}
        disabled={disabled || isExporting}
        className="navbar-icon-btn"
        title="Export PDF report"
        aria-label="Export PDF report"
      >
        {isExporting ? (
          <Loader2 className="h-5 w-5 animate-spin text-purple-300" />
        ) : (
          <FileDown className="h-5 w-5" />
        )}
      </button>
    );
  }

  return (
    <motion.button
      type="button"
      onClick={handleExport}
      disabled={disabled || isExporting}
      whileHover={disabled || isExporting ? undefined : { scale: 1.02, y: -1 }}
      whileTap={disabled || isExporting ? undefined : { scale: 0.98 }}
      className="export-report-btn flex w-full items-center justify-center gap-2 rounded-xl border border-purple-500/40 bg-gradient-to-r from-purple-600/80 to-violet-600/80 px-5 py-3 text-sm font-bold text-white shadow-[0_4px_24px_rgba(124,58,237,0.35)] transition-opacity disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
    >
      {isExporting ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Generating report…</span>
        </>
      ) : (
        <>
          <FileDown className="h-4 w-4" />
          <span>Export Report</span>
        </>
      )}
    </motion.button>
  );
}
