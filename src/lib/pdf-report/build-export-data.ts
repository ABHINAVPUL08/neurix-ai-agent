import { NEURIX_CAPABILITIES } from "@/lib/business-knowledge";
import {
  extractBulletItems,
  parseDocumentAnalysis,
} from "@/lib/parse-document-analysis";
import type {
  AuditReportExportData,
  PdfExecutionPlan,
  PdfReportSection,
  PdfScorecard,
} from "@/lib/pdf-report/types";

function getSectionBody(
  sections: ReturnType<typeof parseDocumentAnalysis>["sections"],
  slug: string,
): string {
  return sections.find((s) => s.slug === slug)?.body ?? "";
}

function bodyToParagraphs(body: string): string[] {
  const cleaned = body.replace(/\*\*/g, "").trim();
  if (!cleaned) return [];
  const paras = cleaned
    .split(/\n\n+/)
    .map((p) => p.replace(/^[-*•]\s+/gm, "").trim())
    .filter(Boolean);
  return paras.length > 0 ? paras : [cleaned];
}

function deriveProjectName(filename?: string, content?: string): string {
  if (filename) {
    return filename
      .replace(/\.(pdf|docx|txt)$/i, "")
      .replace(/[-_]/g, " ")
      .trim();
  }
  const match = content?.match(
    /(?:Attached|uploaded):\*?\*?\s*([^\n]+)/i,
  );
  if (match) {
    return match[1]
      .replace(/\.(pdf|docx|txt)$/i, "")
      .replace(/[-_]/g, " ")
      .trim();
  }
  return "Business Project";
}

function buildWorkflowImprovements(
  problems: string[],
  solutions: string[],
): string[] {
  const items: string[] = [];
  problems.slice(0, 3).forEach((p) => {
    items.push(`Streamline: ${p.replace(/\.$/, "")}`);
  });
  solutions.slice(0, 3).forEach((s) => {
    items.push(`Automate: ${s.replace(/\.$/, "")}`);
  });
  return items.length > 0
    ? items
    : [
        "Centralize customer communication into one AI-assisted inbox",
        "Replace manual booking follow-ups with automated reminders",
        "Connect sales, support, and operations data in a single dashboard",
      ];
}

function pickNeurixSystems(summary: string, solutions: string[]): string[] {
  const text = `${summary} ${solutions.join(" ")}`.toLowerCase();
  const matched = NEURIX_CAPABILITIES.filter((cap) => {
    const keys = cap.toLowerCase().split(/\s+/).filter((w) => w.length > 4);
    return keys.some((k) => text.includes(k.slice(0, 5)));
  });
  const picked = matched.length >= 4 ? matched.slice(0, 6) : [...NEURIX_CAPABILITIES.slice(0, 6)];
  return [...new Set(picked)].slice(0, 6);
}

function buildExecutionPlan(
  summary: string,
  solutions: string[],
  mvpBody: string,
): PdfExecutionPlan {
  const systems = pickNeurixSystems(summary, solutions);
  return {
    systems,
    integrations: [
      "Website & landing page chat widget",
      "WhatsApp Business API for customer messaging",
      "CRM (HubSpot, Salesforce, or Pipedrive)",
      "Calendar & booking tools (Calendly, Google Calendar)",
      "Email & SMS notification providers",
      "Analytics (GA4, Mixpanel, or custom dashboard)",
    ],
    phases: [
      {
        phase: "Phase 1 — Discovery & Quick Wins",
        items: [
          "Audit current workflows and customer touchpoints",
          "Deploy AI chatbot or WhatsApp assistant for tier-1 support",
          "Automate booking confirmations and follow-up reminders",
        ],
      },
      {
        phase: "Phase 2 — Core AI Systems",
        items: [
          "Launch CRM automation and lead routing",
          "Integrate voice or advanced booking assistant if needed",
          "Build operations dashboard for owners and managers",
        ],
      },
      {
        phase: "Phase 3 — Scale & Optimize",
        items: [
          "Expand analytics, retention campaigns, and upsell flows",
          "Fine-tune AI models on your business data",
          "Ongoing Neurix support, monitoring, and iteration",
        ],
      },
    ],
    deployment: [
      "Cloud-hosted SaaS deployment with secure API access",
      "Staging environment for owner approval before go-live",
      "Staff onboarding and playbook documentation",
      mvpBody
        ? "MVP scope aligned to your audit roadmap (see MVP section)"
        : "Phased rollout to minimize disruption to daily operations",
    ],
  };
}

function buildScorecard(
  problemCount: number,
  solutionCount: number,
  contentLength: number,
): PdfScorecard {
  const readinessScore = Math.min(
    92,
    Math.max(
      68,
      70 +
        Math.min(problemCount, 5) * 3 +
        Math.min(solutionCount, 6) * 2 +
        Math.min(Math.floor(contentLength / 800), 8),
    ),
  );

  const automationPriority: PdfScorecard["automationPriority"] =
    problemCount >= 5 ? "High" : problemCount >= 3 ? "Medium" : "Low";

  return {
    readinessScore,
    readinessLabel:
      readinessScore >= 85
        ? "Strong AI readiness"
        : readinessScore >= 75
          ? "Ready for automation"
          : "Emerging opportunity",
    automationPriority,
    estimatedRoiRange: "40%–65% operational efficiency gain (typical)",
    phases: [
      {
        label: "Quick Win",
        duration: "2–4 weeks",
        focus: "Chatbot, booking, or WhatsApp automation",
      },
      {
        label: "Core MVP",
        duration: "4–8 weeks",
        focus: "CRM, dashboards, integrated workflows",
      },
      {
        label: "Scale",
        duration: "8–12+ weeks",
        focus: "Voice AI, analytics, advanced automation",
      },
    ],
  };
}

function mapToPdfSections(
  parsed: ReturnType<typeof parseDocumentAnalysis>,
): PdfReportSection[] {
  const { sections } = parsed;
  const summaryBody = getSectionBody(sections, "business-summary");
  const problems = extractBulletItems(
    getSectionBody(sections, "key-business-problems"),
  );
  const solutions = extractBulletItems(
    getSectionBody(sections, "ai-solutions-suggested"),
  );
  const impact = extractBulletItems(
    getSectionBody(sections, "expected-business-impact"),
  );
  const features = extractBulletItems(
    getSectionBody(sections, "recommended-features"),
  );
  const mvpBody = getSectionBody(sections, "recommended-mvp");
  const growth = extractBulletItems(
    getSectionBody(sections, "growth-opportunities"),
  );
  const tech = extractBulletItems(
    getSectionBody(sections, "advanced-technical-architecture"),
  );

  const pdfSections: PdfReportSection[] = [];

  if (summaryBody) {
    pdfSections.push({
      id: "executive-summary",
      title: "Executive Summary",
      subtitle: "Business overview and strategic context",
      paragraphs: bodyToParagraphs(summaryBody),
    });
  }

  if (problems.length > 0) {
    pdfSections.push({
      id: "problems",
      title: "Business Problems Identified",
      subtitle: "Operational and customer experience gaps",
      bullets: problems,
    });
  }

  if (solutions.length > 0) {
    pdfSections.push({
      id: "ai-opportunities",
      title: "AI Opportunities",
      subtitle: "Highest-impact automation and AI leverage points",
      bullets: solutions.slice(0, Math.ceil(solutions.length / 2) || solutions.length),
    });
    pdfSections.push({
      id: "automation",
      title: "Automation Recommendations",
      subtitle: "Practical systems to deploy first",
      bullets: solutions,
      variant: "default",
    });
  }

  const workflow = buildWorkflowImprovements(problems, solutions);
  pdfSections.push({
    id: "workflow",
    title: "Workflow Improvements",
    subtitle: "Process upgrades before and after AI deployment",
    bullets: workflow,
  });

  if (features.length > 0) {
    pdfSections.push({
      id: "features",
      title: "Suggested Features",
      subtitle: "Product capabilities for your customers and team",
      bullets: features,
    });
  }

  if (impact.length > 0) {
    pdfSections.push({
      id: "impact",
      title: "Expected Business Impact",
      subtitle: "Projected outcomes and efficiency gains",
      bullets: impact,
      variant: "impact",
    });
    pdfSections.push({
      id: "roi",
      title: "ROI Opportunities",
      subtitle: "Value drivers for owners and stakeholders",
      bullets: impact.map((b) =>
        b.match(/%|reduce|improve|increase|faster|higher/i)
          ? b
          : `Potential uplift: ${b}`,
      ),
      variant: "impact",
    });
  }

  if (mvpBody) {
    pdfSections.push({
      id: "mvp",
      title: "MVP Roadmap",
      subtitle: "Phased delivery plan",
      paragraphs: bodyToParagraphs(mvpBody),
      bullets: extractBulletItems(mvpBody),
      variant: "roadmap",
    });
    pdfSections.push({
      id: "phases",
      title: "Estimated Development Phases",
      subtitle: "Timeline-oriented implementation view",
      bullets: extractBulletItems(mvpBody).length
        ? extractBulletItems(mvpBody)
        : [
            "Phase 1 (2–4 weeks): Quick-win automation & AI assistant",
            "Phase 2 (4–8 weeks): CRM, dashboard, core integrations",
            "Phase 3 (8–12 weeks): Scale, analytics, advanced AI features",
          ],
      variant: "roadmap",
    });
  }

  if (tech.length > 0) {
    pdfSections.push({
      id: "tech-stack",
      title: "Recommended AI Stack",
      subtitle: "Technical architecture (optional reference)",
      bullets: tech,
      variant: "tech",
    });
  }

  if (growth.length > 0) {
    pdfSections.push({
      id: "final",
      title: "Final Recommendations",
      subtitle: "Strategic next steps for leadership",
      bullets: growth,
    });
  }

  return pdfSections;
}

export function buildAuditReportExportData(params: {
  analysisContent: string;
  sourceFilename?: string;
  projectName?: string;
  generatedAt?: Date;
}): AuditReportExportData {
  const parsed = parseDocumentAnalysis(params.analysisContent);
  const summaryBody = getSectionBody(parsed.sections, "business-summary");
  const solutions = extractBulletItems(
    getSectionBody(parsed.sections, "ai-solutions-suggested"),
  );
  const problems = extractBulletItems(
    getSectionBody(parsed.sections, "key-business-problems"),
  );
  const mvpBody = getSectionBody(parsed.sections, "recommended-mvp");

  const generatedAt = params.generatedAt ?? new Date();
  const projectName =
    params.projectName ??
    deriveProjectName(params.sourceFilename, params.analysisContent);

  const pdfSections = mapToPdfSections(parsed);

  const executionPlan = buildExecutionPlan(summaryBody, solutions, mvpBody);
  const scorecard = buildScorecard(
    problems.length,
    solutions.length,
    params.analysisContent.length,
  );

  return {
    projectName,
    sourceFilename: params.sourceFilename,
    generatedAt: generatedAt.toISOString(),
    generatedAtDisplay: generatedAt.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    sections: pdfSections,
    scorecard,
    executionPlan,
  };
}

export function auditReportFilename(): string {
  return "neurix-ai-report.pdf";
}
