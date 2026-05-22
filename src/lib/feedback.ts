"use client";

import emailjs from "@emailjs/browser";
import {
  logEmailJsConfigDebug,
  resolveEmailJsConfig,
  type EmailJsPublicConfig,
} from "@/lib/emailjs-env";

export const FEEDBACK_SUCCESS_MESSAGE = "Feedback sent successfully";

export const FEEDBACK_ERROR_MESSAGE =
  "Unable to send feedback. Please try again.";

export const FEEDBACK_CATEGORIES = [
  "Bug",
  "Feature Request",
  "UI Issue",
  "Performance",
  "Mobile",
  "AI Response",
  "Suggestion",
  "Other",
] as const;

export type FeedbackCategory = (typeof FEEDBACK_CATEGORIES)[number];

export const OTHER_CATEGORY: FeedbackCategory = "Other";

export type FeedbackFormData = {
  message: string;
  email: string;
  categories: FeedbackCategory[];
  otherText: string;
};

export type FeedbackMetadata = {
  page: string;
  screenWidth: number;
  screenHeight: number;
  deviceType: "mobile" | "tablet" | "desktop";
  userAgent?: string;
};

let emailJsInitialized = false;

function ensureEmailJsInit(publicKey: string): void {
  if (emailJsInitialized) return;
  emailjs.init({ publicKey });
  emailJsInitialized = true;
}

function configSource(
  config: EmailJsPublicConfig,
): "build" | "api" {
  const fromBuild = Boolean(
    process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID?.trim() &&
      process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID?.trim() &&
      process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY?.trim(),
  );
  return fromBuild ? "build" : "api";
}

export function collectFeedbackMetadata(): FeedbackMetadata {
  if (typeof window === "undefined") {
    return {
      page: "/",
      screenWidth: 0,
      screenHeight: 0,
      deviceType: "desktop",
    };
  }

  const w = window.innerWidth;
  let deviceType: FeedbackMetadata["deviceType"] = "desktop";
  if (w < 768) deviceType = "mobile";
  else if (w < 1024) deviceType = "tablet";

  return {
    page: `${window.location.pathname}${window.location.search}`,
    screenWidth: w,
    screenHeight: window.innerHeight,
    deviceType,
    userAgent: navigator.userAgent.slice(0, 512),
  };
}

export function formatCategoryLabel(
  categories: FeedbackCategory[],
  otherText?: string,
): string {
  let label = categories.join(", ");
  if (categories.includes(OTHER_CATEGORY) && otherText?.trim()) {
    label += ` (${otherText.trim()})`;
  }
  return label;
}

export type SendFeedbackInput = {
  email: string;
  message: string;
  categories: FeedbackCategory[];
  otherText?: string;
};

/** Sends feedback via EmailJS (template must deliver to neurix26@gmail.com). */
export async function sendFeedback(input: SendFeedbackInput): Promise<void> {
  const config = await resolveEmailJsConfig();
  const source = config ? configSource(config) : "missing";

  logEmailJsConfigDebug(config, source);

  if (!config) {
    throw new Error(
      "EmailJS is not configured. Set NEXT_PUBLIC_EMAILJS_* in Vercel and redeploy.",
    );
  }

  ensureEmailJsInit(config.publicKey);

  const metadata = collectFeedbackMetadata();
  const category = formatCategoryLabel(input.categories, input.otherText);

  const templateParams = {
    email: input.email,
    message: input.message,
    category,
    other_text: input.otherText?.trim() ?? "",
    page_url: metadata.page,
    device_type: metadata.deviceType,
    screen_size: `${metadata.screenWidth}×${metadata.screenHeight}`,
    user_agent: metadata.userAgent ?? "",
    submitted_at: new Date().toISOString(),
  };

  try {
    const result = await emailjs.send(
      config.serviceId,
      config.templateId,
      templateParams,
      config.publicKey,
    );

    console.log("[EmailJS] send status:", result.status, result.text);

    if (result.status !== 200) {
      throw new Error(result.text || "EmailJS send failed");
    }
  } catch (error) {
    console.error("EmailJS Error:", error);
    throw error;
  }
}
