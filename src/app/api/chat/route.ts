import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { buildModeSystemAddon, resolveAiMode } from "@/lib/ai-modes";
import { resolveChatError } from "@/lib/chat-errors";
import {
  OPENAI_MAX_TOKENS,
  OPENAI_MODEL,
  OPENAI_TEMPERATURE,
  NEURIX_SYSTEM_PROMPT,
} from "@/lib/constants";
import {
  sanitizeChatMessages,
  validateChatMessages,
} from "@/lib/api/limits";
import { logger } from "@/lib/logger";
import { logOpenAiEnv, readOpenAiApiKey } from "@/lib/server-env";

export const CHAT_AI_PROVIDER = "openai" as const;

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type ImageAttachmentPayload = {
  kind?: "image";
  name?: string;
  mimeType?: string;
  dataUrl?: string;
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

function createChatOpenAiClient(): OpenAI {
  logOpenAiEnv();

  const apiKey = readOpenAiApiKey();
  if (!apiKey) {
    throw new Error(
      "OPENAI_API_KEY is not configured. Add it in Vercel Production and redeploy.",
    );
  }

  console.log("[chat] provider:", CHAT_AI_PROVIDER);
  console.log("[chat] selected model:", OPENAI_MODEL);

  return new OpenAI({ apiKey });
}

function getChatEnvStatus() {
  const key = readOpenAiApiKey();
  return {
    openAiKeyConfigured: Boolean(key),
    openAiKeyLength: key?.length ?? 0,
    provider: CHAT_AI_PROVIDER,
    model: OPENAI_MODEL,
    vercelEnv: process.env.VERCEL_ENV ?? null,
    runtime: "nodejs" as const,
  };
}

function parseImageAttachment(value: unknown): ImageAttachmentPayload | null {
  if (!value || typeof value !== "object") return null;
  const attachment = value as ImageAttachmentPayload;
  if (
    attachment.kind !== "image" ||
    typeof attachment.dataUrl !== "string" ||
    typeof attachment.mimeType !== "string" ||
    !attachment.mimeType.startsWith("image/") ||
    !attachment.dataUrl.startsWith("data:image/")
  ) {
    return null;
  }
  return attachment;
}

function extractFirstUrl(text: string): string | null {
  const match = text.match(/https?:\/\/[^\s<>"')]+/i);
  if (!match) return null;
  try {
    return new URL(match[0]).toString();
  } catch {
    return null;
  }
}

function extractMetaContent(html: string, name: string): string {
  const regex = new RegExp(
    `<meta[^>]+(?:name|property)=["']${name}["'][^>]+content=["']([^"']+)["'][^>]*>`,
    "i",
  );
  return html.match(regex)?.[1]?.trim() ?? "";
}

async function buildWebsiteContext(url: string): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "NeurixAI/1.0 website analysis bot",
        Accept: "text/html,application/xhtml+xml",
      },
    });
    clearTimeout(timeout);

    if (!res.ok) return null;
    const html = await res.text();
    const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.trim();
    const description =
      extractMetaContent(html, "description") ||
      extractMetaContent(html, "og:description");
    const text = html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 5000);

    return [
      `Website URL: ${url}`,
      title ? `Title: ${title}` : "",
      description ? `Description: ${description}` : "",
      text ? `Visible page text excerpt: ${text}` : "",
    ]
      .filter(Boolean)
      .join("\n");
  } catch (error) {
    console.warn("[chat] website analysis fetch failed:", error);
    return null;
  }
}

async function enrichLatestUserMessageForUrl(messages: ChatMessage[]) {
  const lastUserIndex = messages.findLastIndex((m) => m.role === "user");
  if (lastUserIndex < 0) return messages;

  const url = extractFirstUrl(messages[lastUserIndex].content);
  if (!url) return messages;

  const websiteContext = await buildWebsiteContext(url);
  if (!websiteContext) return messages;

  return messages.map((message, index) =>
    index === lastUserIndex
      ? {
          ...message,
          content: `${message.content}\n\nWebsite context for analysis:\n${websiteContext}`,
        }
      : message,
  );
}

/** Safe production health check — confirms server env without exposing secrets. */
export async function GET() {
  logOpenAiEnv();
  const status = getChatEnvStatus();
  console.log("[chat] GET health:", status);

  return NextResponse.json({
    ok: status.openAiKeyConfigured,
    ...status,
    hint: status.openAiKeyConfigured
      ? null
      : "Set OPENAI_API_KEY in Vercel (Production) and redeploy.",
  });
}

export async function POST(request: NextRequest) {
  try {
    logOpenAiEnv();

    const body = await request.json();
    const messages = await enrichLatestUserMessageForUrl(
      sanitizeChatMessages(body?.messages),
    );
    const imageAttachment = parseImageAttachment(body?.attachment);
    const mode = resolveAiMode(body?.mode as string | undefined);
    const stream = body?.stream === true;

    console.log("[chat] POST start:", { ...getChatEnvStatus(), stream });

    const validationError = validateChatMessages(messages);
    if (validationError) {
      return NextResponse.json(
        { error: validationError, code: "invalid_request" },
        { status: 400 },
      );
    }

    const openai = createChatOpenAiClient();
    const systemPrompt = NEURIX_SYSTEM_PROMPT + buildModeSystemAddon(mode);

    const lastUserIndex = messages.findLastIndex((m) => m.role === "user");
    const chatMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: "system", content: systemPrompt },
      ...messages.map(
        (m, index): OpenAI.Chat.Completions.ChatCompletionMessageParam => {
          if (m.role === "assistant") {
            return { role: "assistant", content: m.content };
          }

          if (imageAttachment && index === lastUserIndex) {
            return {
              role: "user",
              content: [
                {
                  type: "text",
                  text: `${m.content}\n\nAnalyze the attached image (${imageAttachment.name ?? "upload"}) and answer the user's request with practical business, UI/UX, bug, or design feedback as relevant.`,
                },
                {
                  type: "image_url",
                  image_url: {
                    url: imageAttachment.dataUrl!,
                    detail: "auto",
                  },
                },
              ],
            };
          }

          return { role: "user", content: m.content };
        },
      ),
    ];

    if (stream) {
      const completion = await openai.chat.completions.create({
        model: OPENAI_MODEL,
        messages: chatMessages,
        temperature: OPENAI_TEMPERATURE,
        max_tokens: OPENAI_MAX_TOKENS,
        stream: true,
      });

      const encoder = new TextEncoder();

      const readable = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of completion) {
              const text = chunk.choices[0]?.delta?.content ?? "";
              if (text) {
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify({ text })}\n\n`),
                );
              }
            }
            controller.enqueue(encoder.encode("data: [DONE]\n\n"));
            controller.close();
          } catch (err) {
            console.error("[chat] stream error:", err);
            const { body: errorBody } = resolveChatError(err);
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ error: errorBody.error })}\n\n`,
              ),
            );
            controller.close();
          }
        },
      });

      return new Response(readable, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache, no-transform",
          Connection: "keep-alive",
        },
      });
    }

    const completion = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      messages: chatMessages,
      temperature: OPENAI_TEMPERATURE,
      max_tokens: OPENAI_MAX_TOKENS,
    });

    const reply = completion.choices[0]?.message?.content?.trim();

    if (!reply) {
      return NextResponse.json(
        { error: "No response from AI", code: "empty_response" },
        { status: 502 },
      );
    }

    return NextResponse.json({ message: reply });
  } catch (error) {
    console.error("[chat] API response error:", error);
    logger.error("chat", error);

    const { status, body } = resolveChatError(error);
    return NextResponse.json(body, { status });
  }
}
