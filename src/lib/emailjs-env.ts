"use client";

/** Public EmailJS credentials (safe to expose to the browser). */
export type EmailJsPublicConfig = {
  serviceId: string;
  templateId: string;
  publicKey: string;
};

function readBuildTimeConfig(): EmailJsPublicConfig | null {
  const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID?.trim();
  const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID?.trim();
  const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY?.trim();

  if (!serviceId || !templateId || !publicKey) {
    return null;
  }

  return { serviceId, templateId, publicKey };
}

let runtimeConfigCache: EmailJsPublicConfig | null | undefined;

/** Build-time env first; falls back to /api/emailjs-config (Vercel runtime env). */
export async function resolveEmailJsConfig(): Promise<EmailJsPublicConfig | null> {
  const fromBuild = readBuildTimeConfig();
  if (fromBuild) {
    return fromBuild;
  }

  if (runtimeConfigCache !== undefined) {
    return runtimeConfigCache;
  }

  try {
    const res = await fetch("/api/emailjs-config", { cache: "no-store" });
    if (!res.ok) {
      runtimeConfigCache = null;
      return null;
    }

    const data = (await res.json()) as {
      serviceId?: string;
      templateId?: string;
      publicKey?: string;
    };

    const serviceId = data.serviceId?.trim();
    const templateId = data.templateId?.trim();
    const publicKey = data.publicKey?.trim();

    if (!serviceId || !templateId || !publicKey) {
      runtimeConfigCache = null;
      return null;
    }

    runtimeConfigCache = { serviceId, templateId, publicKey };
    return runtimeConfigCache;
  } catch {
    runtimeConfigCache = null;
    return null;
  }
}

export function logEmailJsConfigDebug(
  config: EmailJsPublicConfig | null,
  source: "build" | "api" | "missing",
): void {
  console.log("[EmailJS] config source:", source);
  console.log("[EmailJS] service ID:", config?.serviceId ?? "(missing)");
  console.log("[EmailJS] template ID:", config?.templateId ?? "(missing)");
  console.log("[EmailJS] public key exists:", Boolean(config?.publicKey));
}
