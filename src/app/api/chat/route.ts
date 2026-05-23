import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { buildModeSystemAddon, resolveAiMode } from "@/lib/ai-modes";
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
import { getOpenAiClient } from "@/lib/openai";

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type ErrorPayload = {
  error: string;
  code?: string;
};

function resolveChatError(error: unknown): { status: number; body: ErrorPayload } {
  if (error instanceof OpenAI.RateLimitError) {
    return {
      status: 429,
      body: {
        error: "Rate limit exceeded. Please wait a moment and try again.",
        code: "rate_limit",
      },
    };
  }

  if (error instanceof OpenAI.AuthenticationError) {
    return {
      status: 401,
      body: {
        error: "AI service is not configured. Contact support.",
        code: "invalid_api_key",
      },
    };
  }

  if (error instanceof OpenAI.BadRequestError) {
    return {
      status: 400,
      body: {
        error: error.message || "Invalid chat request.",
        code: "invalid_request",
      },
    };
  }

  if (error instanceof OpenAI.APIError) {
    return {
      status: error.status ?? 502,
      body: {
        error: error.message || "OpenAI API error. Please try again.",
        code: "openai_api_error",
      },
    };
  }

  if (error instanceof SyntaxError) {
    return {
      status: 400,
      body: { error: "Invalid JSON body.", code: "invalid_request" },
    };
  }

  const message =
    error instanceof Error ? error.message : "Internal server error";

  if (message.includes("OPENAI_API_KEY")) {
    return {
      status: 503,
      body: { error: message, code: "missing_api_key" },
    };
  }

  return {
    status: 500,
    body: { error: message, code: "internal_error" },
  };
}

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const messages = sanitizeChatMessages(body?.messages);
    const mode = resolveAiMode(body?.mode as string | undefined);
    const stream = body?.stream === true;

    const validationError = validateChatMessages(messages);
    if (validationError) {
      console.log("[chat] validation failed:", validationError, {
        messages,
      });
      return NextResponse.json(
        { error: validationError, code: "invalid_request" },
        { status: 400 },
      );
    }

    const openai = getOpenAiClient();
    const systemPrompt = NEURIX_SYSTEM_PROMPT + buildModeSystemAddon(mode);

    const chatMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: "system", content: systemPrompt },
      ...messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    ];

    console.log("[chat] messages:", chatMessages);
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
            console.error("[chat] API response error:", err);
            const message =
              err instanceof Error ? err.message : "Stream error";
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ error: message })}\n\n`,
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
