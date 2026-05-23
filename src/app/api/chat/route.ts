import { NextRequest, NextResponse } from "next/server";
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
import { normalizeEnvValue } from "@/lib/env";
import { logger } from "@/lib/logger";
import { CHAT_AI_PROVIDER, createOpenAiClient } from "@/lib/openai";
import type OpenAI from "openai";

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

function getChatEnvStatus() {
  const key = normalizeEnvValue(process.env.OPENAI_API_KEY);
  return {
    openAiKeyConfigured: Boolean(key),
    openAiKeyLength: key?.length ?? 0,
    openAiKeyLooksValid: Boolean(key?.startsWith("sk-")),
    provider: CHAT_AI_PROVIDER,
    model: OPENAI_MODEL,
    vercelEnv: process.env.VERCEL_ENV ?? null,
    runtime: "nodejs" as const,
  };
}

/** Safe production health check — confirms server env without exposing secrets. */
export async function GET() {
  const status = getChatEnvStatus();
  console.log("OPENAI KEY EXISTS:", !!process.env.OPENAI_API_KEY);
  console.log("[chat] GET health:", status);

  return NextResponse.json({
    ok: status.openAiKeyConfigured && status.openAiKeyLooksValid,
    ...status,
    hint:
      status.openAiKeyConfigured && status.openAiKeyLooksValid
        ? null
        : "Set a valid OpenAI sk- key as OPENAI_API_KEY in Vercel (Production) and redeploy.",
  });
}

export async function POST(request: NextRequest) {
  try {
    console.log("OPENAI KEY EXISTS:", !!process.env.OPENAI_API_KEY);

    const body = await request.json();
    const messages = sanitizeChatMessages(body?.messages);
    const mode = resolveAiMode(body?.mode as string | undefined);
    const stream = body?.stream === true;

    const envStatus = getChatEnvStatus();
    console.log("[chat] POST start:", { ...envStatus, stream });

    const validationError = validateChatMessages(messages);
    if (validationError) {
      return NextResponse.json(
        { error: validationError, code: "invalid_request" },
        { status: 400 },
      );
    }

    const openai = createOpenAiClient();
    const systemPrompt = NEURIX_SYSTEM_PROMPT + buildModeSystemAddon(mode);

    const chatMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: "system", content: systemPrompt },
      ...messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    ];

    console.log("[chat] provider:", CHAT_AI_PROVIDER);
    console.log("[chat] selected model:", OPENAI_MODEL);

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
