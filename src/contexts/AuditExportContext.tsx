"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { ExportLoaderModal } from "@/components/modals/ExportLoaderModal";
import type { ExportToastState } from "@/components/ui/ExportToast";
import {
  exportAuditReport,
  type ExportAuditParams,
} from "@/lib/pdf-report/export-audit-report";

type AuditExportContextValue = {
  isExporting: boolean;
  exportReport: (params: ExportAuditParams) => Promise<boolean>;
};

const AuditExportContext = createContext<AuditExportContextValue | null>(null);

export function AuditExportProvider({
  children,
  onToast,
}: {
  children: ReactNode;
  onToast?: (toast: ExportToastState) => void;
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const progressTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearProgressTimer = useCallback(() => {
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current);
      progressTimerRef.current = null;
    }
  }, []);

  const exportReport = useCallback(
    async (params: ExportAuditParams): Promise<boolean> => {
      if (isExporting) return false;

      setIsExporting(true);
      setModalOpen(true);
      setProgress(4);
      onToast?.(null);

      clearProgressTimer();
      progressTimerRef.current = setInterval(() => {
        setProgress((p) => (p >= 88 ? p : p + 4));
      }, 350);

      try {
        await exportAuditReport(params, setProgress);
        setProgress(100);
        onToast?.({
          type: "success",
          message: "Neurix report exported successfully",
          filename: "neurix-ai-report.pdf",
        });
        window.setTimeout(() => setModalOpen(false), 500);
        return true;
      } catch (err) {
        setModalOpen(false);
        onToast?.({
          type: "error",
          message:
            err instanceof Error
              ? err.message
              : "Failed to generate report. Please try again.",
        });
        return false;
      } finally {
        clearProgressTimer();
        setIsExporting(false);
      }
    },
    [isExporting, onToast, clearProgressTimer],
  );

  const value = useMemo(
    () => ({ isExporting, exportReport }),
    [isExporting, exportReport],
  );

  return (
    <AuditExportContext.Provider value={value}>
      {children}
      <ExportLoaderModal open={modalOpen} progress={progress} />
    </AuditExportContext.Provider>
  );
}

export function useAuditExport(): AuditExportContextValue {
  const ctx = useContext(AuditExportContext);
  if (!ctx) {
    throw new Error("useAuditExport must be used within AuditExportProvider");
  }
  return ctx;
}
