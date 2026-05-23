import { NextRequest, NextResponse } from "next/server";
import {
  APIError,
  AuthenticationError,
  BadRequestError,
  RateLimitError,
} from "groq-sdk";
import { buildModeSystemAddon, resolveAiMode } from "@/lib/ai-modes";
import {
  GROQ_MAX_TOKENS,
  GROQ_MODEL,
  GROQ_TEMPERATURE,
  NEURIX_SYSTEM_PROMPT,
} from "@/lib/constants";
import {
  sanitizeChatMessages,
  validateChatMessages,
} from "@/lib/api/limits";
import { logger } from "@/lib/logger";
import { getGroqClient } from "@/lib/groq";

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type ErrorPayload = {
  error: string;
  code?: string;
};

function resolveChatError(error: unknown): { status: number; body: ErrorPayload } {
  if (error instanceof RateLimitError) {
    return {
      status: 429,
      body: {
        error: "Rate limit exceeded. Please wait a moment and try again.",
        code: "rate_limit",
      },
    };
  }

  if (error instanceof AuthenticationError) {
    return {
      status: 401,
      body: {
        error: "AI service is not configured. Contact support.",
        code: "invalid_api_key",
      },
    };
  }

  if (error instanceof BadRequestError) {
    return {
      status: 400,
      body: {
        error: error.message || "Invalid chat request.",
        code: "invalid_request",
      },
    };
  }

  if (error instanceof APIError) {
    return {
      status: error.status ?? 502,
      body: {
        error: error.message || "Groq API error. Please try again.",
        code: "groq_api_error",
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

  if (message.includes("GROQ_API_KEY")) {
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

    const groq = getGroqClient();
    const systemPrompt = NEURIX_SYSTEM_PROMPT + buildModeSystemAddon(mode);

    const groqMessages = [
      { role: "system" as const, content: systemPrompt },
      ...messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    ];

    console.log("[chat] messages:", groqMessages);
    console.log("[chat] selected model:", GROQ_MODEL);

    if (stream) {
      const completion = await groq.chat.completions.create({
        model: GROQ_MODEL,
        messages: groqMessages,
        temperature: GROQ_TEMPERATURE,
        max_tokens: GROQ_MAX_TOKENS,
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

    const completion = await groq.chat.completions.create({
      model: GROQ_MODEL,
      messages: groqMessages,
      temperature: GROQ_TEMPERATURE,
      max_tokens: GROQ_MAX_TOKENS,
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
