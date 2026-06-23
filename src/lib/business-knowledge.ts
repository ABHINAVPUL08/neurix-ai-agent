/** Neurix capabilities, industries, and pricing — used by the AI consultant */

export const NEURIX_CAPABILITIES = [
  "AI chatbots & website assistants",
  "Voice AI agents (phone & web)",
  "CRM automation & lead routing",
  "OCR & document processing pipelines",
  "WhatsApp AI & messaging automation",
  "Lead generation & qualification systems",
  "AI customer support (24/7 tier-1)",
  "SaaS MVP design & development",
  "Workflow automation (n8n, Zapier, custom)",
  "AI dashboards & internal ops tools",
  "Appointment & booking automation",
  "Document intake, extraction & classification",
] as const;

export const NEURIX_INDUSTRIES = [
  "startups & founders",
  "law firms",
  "hotels & hospitality",
  "healthcare clinics",
  "real estate",
  "e-commerce",
  "restaurants",
  "cafés & coffee shops",
  "marketing agencies",
  "education & training",
  "SaaS companies",
  "enterprise teams",
] as const;

/** Industry → typical AI opportunities (consultant playbook) */
export const INDUSTRY_PLAYBOOK: Record<string, string[]> = {
  startups: [
    "MVP chatbot for landing-page conversion",
    "Founder dashboard for ops metrics",
    "Lightweight CRM + lead follow-up automation",
  ],
  "law firms": [
    "Client intake chatbot + document OCR",
    "Appointment scheduling automation",
    "Case document classification & search",
  ],
  hotels: [
    "Guest FAQ voice/chat concierge",
    "Booking & upsell automation via WhatsApp",
    "Review-response & support triage",
  ],
  healthcare: [
    "Patient FAQ & appointment bots (HIPAA-aware scoping)",
    "Form OCR & referral routing",
    "After-hours voice triage to staff",
  ],
  "real estate": [
    "Lead qualification chatbot",
    "Property inquiry voice agent",
    "CRM sync for showings & follow-ups",
  ],
  "e-commerce": [
    "Support bot + order-status automation",
    "Cart recovery WhatsApp flows",
    "Product FAQ & returns deflection",
  ],
  restaurants: [
    "Reservation & menu WhatsApp bot",
    "Peak-hour order/support automation",
    "Review & feedback routing",
  ],
  cafes: [
    "WhatsApp ordering & pickup notifications",
    "Table booking & waitlist automation",
    "Hindi + English menu FAQ voice/chat bot",
    "Loyalty offers & repeat-customer follow-ups",
  ],
  agencies: [
    "Client reporting dashboards",
    "Lead gen bots for campaigns",
    "Internal workflow automation",
  ],
  education: [
    "Enrollment & FAQ chatbots",
    "Student support automation",
    "Document processing for applications",
  ],
  saas: [
    "In-app AI assistant",
    "Onboarding automation",
    "Support deflection + usage dashboards",
  ],
  enterprise: [
    "Department-specific workflow automation",
    "Document OCR at scale",
    "Internal knowledge assistants",
  ],
};

export const NEURIX_PRICING = [
  "Starter AI chatbot: $300–$1,000",
  "AI automation workflow: $1,000–$5,000",
  "Voice AI agent: $2,000–$8,000",
  "SaaS MVP: $3,000–$15,000",
  "Enterprise AI systems: $15,000+ (only when they ask for large/custom scope)",
] as const;

export const NEURIX_VALUE_PROPS = [
  "End-to-end implementation — not just model access",
  "Integrations: WhatsApp, CRMs, Stripe, dashboards, internal tools",
  "Faster time-to-production for founders and SMBs",
  "Ongoing optimization & scaling support",
  "Founder-friendly pricing vs. large agencies",
] as const;
