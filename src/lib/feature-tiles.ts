import type { AiModeId } from "@/lib/ai-modes";

export type FeatureTileId =
  | "ai-agents"
  | "saas"
  | "ocr"
  | "voice"
  | "workflow"
  | "business-tools";

export type FeatureTileConfig = {
  id: FeatureTileId;
  label: string;
  description: string;
  aiModeId: AiModeId;
  starterPrompt: string;
  suggestions: string[];
  openUploadOnClick?: boolean;
};

export const FEATURE_TILES: FeatureTileConfig[] = [
  {
    id: "ai-agents",
    label: "AI Agents",
    description: "Custom assistants",
    aiModeId: "workflow-designer",
    starterPrompt:
      "Help me build a custom AI assistant for my business.",
    suggestions: [
      "Design a multi-step AI agent for my team",
      "Map triggers and handoffs for my assistant",
      "Compare build vs buy for custom agents",
      "Estimate timeline and cost for an AI agent MVP",
    ],
  },
  {
    id: "saas",
    label: "SaaS Development",
    description: "MVPs & products",
    aiModeId: "saas-architect",
    starterPrompt:
      "Generate a SaaS product roadmap, tech stack, pricing, and feature plan.",
    suggestions: [
      "Outline a 90-day SaaS MVP scope",
      "Recommend a modern stack for my SaaS idea",
      "Draft pricing tiers and packaging",
      "List must-have vs nice-to-have features",
    ],
  },
  {
    id: "ocr",
    label: "OCR Pipelines",
    description: "Document AI",
    aiModeId: "ocr-engineer",
    starterPrompt:
      "Extract and analyze information from uploaded documents.",
    openUploadOnClick: true,
    suggestions: [
      "Upload Project PDF",
      "Design an OCR pipeline for invoices",
      "Improve extraction accuracy for contracts",
      "Automate document routing after OCR",
    ],
  },
  {
    id: "voice",
    label: "Voice AI",
    description: "Phone & web agents",
    aiModeId: "voice",
    starterPrompt:
      "Help me build a voice AI or call automation system.",
    suggestions: [
      "Design an inbound call flow for bookings",
      "Compare voice providers for my use case",
      "Script a phone agent for customer support",
      "Plan QA and fallback for voice AI",
    ],
  },
  {
    id: "workflow",
    label: "Workflow Automation",
    description: "Ops efficiency",
    aiModeId: "automation",
    starterPrompt: "Analyze and automate my business workflows.",
    suggestions: [
      "Map my highest-ROI automation opportunities",
      "Connect CRM, email, and WhatsApp flows",
      "Reduce manual ops with n8n-style workflows",
      "Estimate hours saved per automation",
    ],
  },
  {
    id: "business-tools",
    label: "Business AI Tools",
    description: "Internal systems",
    aiModeId: "internal-tools",
    starterPrompt:
      "Suggest internal AI tools for my business operations.",
    suggestions: [
      "Recommend an internal ops dashboard",
      "Design a team copilot for daily tasks",
      "Prioritize secure internal AI tools",
      "Plan rollout for internal AI adoption",
    ],
  },
];

const TILE_BY_ID = new Map(FEATURE_TILES.map((t) => [t.id, t]));

export function getFeatureTile(id: FeatureTileId): FeatureTileConfig {
  return TILE_BY_ID.get(id) ?? FEATURE_TILES[0];
}

export const DEFAULT_SUGGESTION_LABELS = [
  "Build AI Voice Agent",
  "Create SaaS MVP",
  "Analyze My Workflow",
  "Upload Project PDF",
  "Automate My Business",
] as const;
