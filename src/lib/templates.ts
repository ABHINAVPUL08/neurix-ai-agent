import {
  Scale,
  Hotel,
  Home,
  HeartPulse,
  Rocket,
  MessageCircle,
  Headphones,
  Coffee,
  type LucideIcon,
} from "lucide-react";

export type IndustryTemplate = {
  id: string;
  title: string;
  description: string;
  prompt: string;
  icon: LucideIcon;
  gradient: string;
};

export const INDUSTRY_TEMPLATES: IndustryTemplate[] = [
  {
    id: "law",
    title: "Law Firm AI",
    description: "Intake, documents & client FAQ",
    prompt:
      "I'm a law firm looking to automate client intake, document OCR, and after-hours FAQ. What AI systems should we build first?",
    icon: Scale,
    gradient: "from-violet-600/30 to-purple-900/20",
  },
  {
    id: "hotel",
    title: "Hotel Automation",
    description: "Guest concierge & bookings",
    prompt:
      "We run a hotel and need AI for guest FAQ, booking assistance, and WhatsApp concierge. Recommend a phased plan.",
    icon: Hotel,
    gradient: "from-fuchsia-600/30 to-purple-900/20",
  },
  {
    id: "cafe",
    title: "Café & Coffee Shop AI",
    description: "Orders, bookings & menu bot",
    prompt:
      "I run a café and need AI for WhatsApp orders, table reservations, menu FAQ in Hindi and English, and peak-hour customer support. What should we build first and what's the budget?",
    icon: Coffee,
    gradient: "from-amber-600/25 to-purple-900/20",
  },
  {
    id: "realestate",
    title: "Real Estate AI",
    description: "Lead qual & showings",
    prompt:
      "I'm in real estate and want AI for lead qualification, property inquiries, and CRM follow-up. What's the best MVP?",
    icon: Home,
    gradient: "from-indigo-600/30 to-purple-900/20",
  },
  {
    id: "healthcare",
    title: "Healthcare AI",
    description: "Patient FAQ & scheduling",
    prompt:
      "We operate a healthcare clinic and need patient FAQ bots, appointment automation, and document intake. Advise on scope and compliance-aware design.",
    icon: HeartPulse,
    gradient: "from-rose-600/25 to-purple-900/20",
  },
  {
    id: "saas",
    title: "SaaS Startup Assistant",
    description: "MVP & product AI",
    prompt:
      "I'm building a SaaS startup and want an AI assistant, onboarding automation, and support deflection. Help me scope an MVP and tech stack.",
    icon: Rocket,
    gradient: "from-purple-600/35 to-violet-900/20",
  },
  {
    id: "whatsapp",
    title: "WhatsApp Sales Agent",
    description: "Messaging automation",
    prompt:
      "I need a WhatsApp AI sales agent for lead qualification, follow-ups, and booking calls. What should Neurix build?",
    icon: MessageCircle,
    gradient: "from-emerald-600/25 to-purple-900/20",
  },
  {
    id: "support",
    title: "Customer Support AI",
    description: "24/7 tier-1 support",
    prompt:
      "Our support team is overloaded. Design an AI customer support system with chat, voice, and CRM integration.",
    icon: Headphones,
    gradient: "from-blue-600/25 to-purple-900/20",
  },
];
