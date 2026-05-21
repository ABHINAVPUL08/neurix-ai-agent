import { DOCUMENT_ANALYSIS_HEADINGS } from "@/lib/document-analysis-prompt";

export type DocumentAnalysisSection = {
  slug: string;
  title: string;
  body: string;
};

export type ParsedDocumentAnalysis = {
  preamble: string;
  sections: DocumentAnalysisSection[];
  isReport: boolean;
};

const HEADING_SLUGS: Record<string, string> = {
  "business summary": "business-summary",
  "key business problems": "key-business-problems",
  "ai solutions suggested": "ai-solutions-suggested",
  "expected business impact": "expected-business-impact",
  "recommended features": "recommended-features",
  "recommended mvp": "recommended-mvp",
  "growth opportunities": "growth-opportunities",
  "advanced technical architecture": "advanced-technical-architecture",
};

function slugifyHeading(title: string): string {
  const key = title.trim().toLowerCase();
  return (
    HEADING_SLUGS[key] ??
    key.replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
  );
}

/** Split markdown body into bullet items for problem/solution cards */
export function extractBulletItems(body: string): string[] {
  const lines = body.split("\n");
  const items: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const match = trimmed.match(/^[-*•]\s+(.+)$/);
    if (match) {
      items.push(match[1].replace(/\*\*/g, "").trim());
      continue;
    }
    const numbered = trimmed.match(/^\d+[.)]\s+(.+)$/);
    if (numbered) {
      items.push(numbered[1].replace(/\*\*/g, "").trim());
    }
  }

  if (items.length === 0 && body.trim()) {
    return [body.trim().replace(/\*\*/g, "")];
  }

  return items;
}

export function parseDocumentAnalysis(content: string): ParsedDocumentAnalysis {
  const normalized = content.replace(/\r\n/g, "\n");
  const parts = normalized.split(/^## /m);

  let preamble = "";
  const sections: DocumentAnalysisSection[] = [];

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (!part.trim()) continue;

    if (i === 0 && !part.includes("\n")) {
      preamble = part.trim();
      continue;
    }

    const newline = part.indexOf("\n");
    const title =
      newline === -1 ? part.trim() : part.slice(0, newline).trim();
    const body =
      newline === -1 ? "" : part.slice(newline + 1).trim();

    if (!title) continue;

    sections.push({
      slug: slugifyHeading(title),
      title,
      body,
    });
  }

  const hasBusinessSummary = sections.some((s) => s.slug === "business-summary");
  const isReport =
    hasBusinessSummary ||
    sections.some((s) =>
      DOCUMENT_ANALYSIS_HEADINGS.some(
        (h) => slugifyHeading(h) === s.slug,
      ),
    );

  return { preamble, sections, isReport };
}

export function isDocumentAnalysisReport(content: string): boolean {
  return parseDocumentAnalysis(content).isReport;
}
