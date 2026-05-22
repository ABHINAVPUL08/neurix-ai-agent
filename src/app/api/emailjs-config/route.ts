import { NextResponse } from "next/server";

/**
 * Exposes public EmailJS IDs at request time (reads Vercel env at runtime).
 * Used when NEXT_PUBLIC_* were not present during `next build`.
 */
export async function GET() {
  const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID?.trim();
  const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID?.trim();
  const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY?.trim();

  if (!serviceId || !templateId || !publicKey) {
    return NextResponse.json(
      {
        error:
          "Missing NEXT_PUBLIC_EMAILJS_SERVICE_ID, NEXT_PUBLIC_EMAILJS_TEMPLATE_ID, or NEXT_PUBLIC_EMAILJS_PUBLIC_KEY on the server.",
      },
      { status: 503 },
    );
  }

  return NextResponse.json(
    { serviceId, templateId, publicKey },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
