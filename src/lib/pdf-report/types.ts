export type PdfReportSection = {
  id: string;
  title: string;
  subtitle?: string;
  paragraphs?: string[];
  bullets?: string[];
  variant?: "default" | "impact" | "tech" | "roadmap";
};

export type PdfScorecard = {
  readinessScore: number;
  readinessLabel: string;
  automationPriority: "High" | "Medium" | "Low";
  estimatedRoiRange: string;
  phases: { label: string; duration: string; focus: string }[];
};

export type PdfExecutionPlan = {
  systems: string[];
  integrations: string[];
  phases: { phase: string; items: string[] }[];
  deployment: string[];
};

export type AuditReportExportData = {
  projectName: string;
  sourceFilename?: string;
  generatedAt: string;
  generatedAtDisplay: string;
  /** Client-only preview; not sent to server */
  logoDataUrl?: string;
  /** Server filesystem path to logo (set by API route) */
  logoPath?: string;
  sections: PdfReportSection[];
  scorecard: PdfScorecard;
  executionPlan: PdfExecutionPlan;
};
