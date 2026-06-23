export const CONSULTATION_EMAIL = "neurix26@gmail.com";

export const CONSULTATION_SUBJECT = "New Consultation Request - Neurix Solution";

export type ConsultationFormData = {
  name: string;
  email: string;
  company: string;
  projectType: string;
  budget: string;
  message: string;
};

export const PROJECT_TYPES = [
  "AI Chatbot / Agent",
  "Workflow Automation",
  "Voice AI Assistant",
  "SaaS / Product Build",
  "Document AI & Analysis",
  "Strategy & Consulting",
  "Other",
] as const;

export const BUDGET_RANGES = [
  "Under $5,000",
  "$5,000 – $15,000",
  "$15,000 – $50,000",
  "$50,000 – $100,000",
  "$100,000+",
  "Not sure yet",
] as const;

export function formatConsultationEmailBody(data: ConsultationFormData): string {
  return [
    "New consultation request from Neurix Solution",
    "",
    `Name: ${data.name}`,
    `Email: ${data.email}`,
    `Company: ${data.company || "—"}`,
    `Project Type: ${data.projectType}`,
    `Budget: ${data.budget}`,
    "",
    "Message:",
    data.message,
    "",
    `Submitted: ${new Date().toLocaleString("en-US", { dateStyle: "full", timeStyle: "short" })}`,
  ].join("\n");
}

export function buildConsultationMailto(data: ConsultationFormData): string {
  const params = new URLSearchParams({
    subject: CONSULTATION_SUBJECT,
    body: formatConsultationEmailBody(data),
  });
  return `mailto:${CONSULTATION_EMAIL}?${params.toString()}`;
}

export function openConsultationMailto(data: ConsultationFormData): void {
  window.location.href = buildConsultationMailto(data);
}
