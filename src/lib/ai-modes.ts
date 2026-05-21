export type AiModeId =
  | "consultant"
  | "saas-architect"
  | "automation"
  | "voice"
  | "ocr-engineer"
  | "crm-automation"
  | "workflow-designer"
  | "startup"
  | "support-ai"
  | "sales-ai"
  | "marketing-ai"
  | "internal-tools";

export type AiMode = {
  id: AiModeId;
  label: string;
  description: string;
  prompt: string;
};

export const AI_MODES: AiMode[] = [
  {
    id: "consultant",
    label: "Business Consultant",
    description: "Strategy, ROI, and AI adoption",
    prompt:
      "Lead as a senior business AI consultant. Focus on pain points, ROI, phased adoption, and consultation CTAs.",
  },
  {
    id: "saas-architect",
    label: "SaaS Architect",
    description: "MVPs, product features, tech stack",
    prompt:
      "Lead as a SaaS architect. Emphasize MVP scope, product features, monetization, stack choices, and scalable architecture.",
  },
  {
    id: "automation",
    label: "Automation Expert",
    description: "Workflows, integrations, ops efficiency",
    prompt:
      "Lead as a workflow automation expert. Prioritize integrations (CRM, WhatsApp, Stripe), n8n/Zapier-style flows, and ops time savings.",
  },
  {
    id: "voice",
    label: "Voice AI Specialist",
    description: "Phone agents, voice UX, telephony",
    prompt:
      "Lead as a voice AI specialist. Focus on phone/web voice agents, call flows, triage, booking, and voice UX best practices.",
  },
  {
    id: "ocr-engineer",
    label: "OCR Pipeline Engineer",
    description: "Document AI, extraction, pipelines",
    prompt:
      "Lead as an OCR and document AI engineer. Focus on PDF/DOCX ingestion, extraction accuracy, validation workflows, and enterprise document automation.",
  },
  {
    id: "crm-automation",
    label: "CRM Automation Expert",
    description: "Sales pipelines, CRM integrations",
    prompt:
      "Lead as a CRM automation expert. Focus on HubSpot, Salesforce, lead routing, follow-ups, and revenue operations automation.",
  },
  {
    id: "workflow-designer",
    label: "AI Workflow Designer",
    description: "Multi-step AI systems, orchestration",
    prompt:
      "Lead as an AI workflow designer. Map multi-step agent flows, human-in-the-loop checkpoints, triggers, and reliable production orchestration.",
  },
  {
    id: "startup",
    label: "Startup Advisor",
    description: "Founders, lean MVPs, fast launches",
    prompt:
      "Lead as a startup advisor. Keep advice lean, founder-friendly, budget-conscious, and focused on fast validation and launch.",
  },
  {
    id: "support-ai",
    label: "Customer Support AI",
    description: "Helpdesk bots, triage, deflection",
    prompt:
      "Lead as a customer support AI specialist. Focus on ticket triage, knowledge bases, escalation paths, CSAT, and support cost reduction.",
  },
  {
    id: "sales-ai",
    label: "AI Sales Assistant",
    description: "Outbound, qualification, follow-up",
    prompt:
      "Lead as an AI sales assistant expert. Focus on lead qualification, personalized outreach, meeting booking, and pipeline acceleration.",
  },
  {
    id: "marketing-ai",
    label: "Marketing AI Strategist",
    description: "Content, campaigns, growth AI",
    prompt:
      "Lead as a marketing AI strategist. Focus on content systems, campaign automation, audience segmentation, and measurable growth outcomes.",
  },
  {
    id: "internal-tools",
    label: "Internal Tools Engineer",
    description: "Ops dashboards, team automation",
    prompt:
      "Lead as an internal tools engineer. Focus on custom admin panels, team workflows, reporting, and secure internal AI copilots.",
  },
];

const MODE_IDS = new Set(AI_MODES.map((m) => m.id));

export function isAiModeId(id: string): id is AiModeId {
  return MODE_IDS.has(id as AiModeId);
}

export function getAiMode(id: AiModeId): AiMode {
  return AI_MODES.find((m) => m.id === id) ?? AI_MODES[0];
}

export function resolveAiMode(id: string | undefined): AiModeId {
  if (id && isAiModeId(id)) return id;
  return "consultant";
}

export function buildModeSystemAddon(modeId: AiModeId): string {
  const mode = getAiMode(modeId);
  return `\n## Active specialist mode: ${mode.label}\n${mode.prompt}\n`;
}
