import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import {
  CONSULTATION_EMAIL,
  CONSULTATION_SUBJECT,
  formatConsultationEmailBody,
  type ConsultationFormData,
} from "@/lib/consultation";

function parseBody(body: unknown): ConsultationFormData | null {
  if (!body || typeof body !== "object") return null;
  const b = body as Record<string, unknown>;
  const name = String(b.name ?? "").trim();
  const email = String(b.email ?? "").trim();
  const company = String(b.company ?? "").trim();
  const projectType = String(b.projectType ?? "").trim();
  const budget = String(b.budget ?? "").trim();
  const message = String(b.message ?? "").trim();

  if (!name || !email || !projectType || !budget || !message) return null;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null;

  return { name, email, company, projectType, budget, message };
}

async function sendViaResend(data: ConsultationFormData): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL ?? "Neurix Solution <onboarding@resend.dev>";
  if (!apiKey) return false;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [CONSULTATION_EMAIL],
        reply_to: data.email,
        subject: CONSULTATION_SUBJECT,
        text: formatConsultationEmailBody(data),
      }),
      signal: controller.signal,
    });

    return res.ok;
  } catch (err) {
    logger.error("consultation", err);
    return false;
  } finally {
    clearTimeout(timeout);
  }
}

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const data = parseBody(json);

    if (!data) {
      return NextResponse.json(
        { error: "Please fill in all required fields with a valid email." },
        { status: 400 },
      );
    }

    const sentViaApi = await sendViaResend(data);

    return NextResponse.json({
      ok: true,
      sentViaApi,
      mailto: !sentViaApi,
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to process your request. Please try again." },
      { status: 500 },
    );
  }
}
