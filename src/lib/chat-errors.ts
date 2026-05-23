import OpenAI from "openai";

export type ChatErrorPayload = {
  error: string;
  code?: string;
};

export function resolveChatError(error: unknown): {
  status: number;
  body: ChatErrorPayload;
} {
  if (error instanceof OpenAI.RateLimitError) {
    return {
      status: 429,
      body: {
        error: "Rate limit exceeded. Please wait a moment and try again.",
        code: "rate_limit",
      },
    };
  }

  const isAuthError =
    error instanceof OpenAI.AuthenticationError ||
    (error instanceof OpenAI.APIError && error.status === 401);

  if (isAuthError) {
    const message =
      error instanceof Error
        ? error.message
        : "Invalid OpenAI API key.";
    console.error("[chat] OpenAI authentication failed:", message);
    return {
      status: 401,
      body: {
        error: `OpenAI authentication failed: ${message}. Verify OPENAI_API_KEY in Vercel.`,
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
    console.error("[chat] OpenAI API error:", error.status, error.message);
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
