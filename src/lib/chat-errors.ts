export type ChatErrorPayload = {
  error: string;
  code?: string;
};

type ApiLikeError = {
  status?: number;
  message?: string;
  code?: string;
};

function asApiError(error: unknown): ApiLikeError | null {
  if (!error || typeof error !== "object") return null;
  const e = error as ApiLikeError;
  return {
    status: typeof e.status === "number" ? e.status : undefined,
    message: typeof e.message === "string" ? e.message : undefined,
    code: typeof e.code === "string" ? e.code : undefined,
  };
}

function errorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "Unknown error";
}

/** Resolve chat API errors — never returns generic "AI service is not configured". */
export function resolveChatError(error: unknown): {
  status: number;
  body: ChatErrorPayload;
} {
  const message = errorMessage(error);
  const api = asApiError(error);

  console.error("[chat] resolveChatError:", {
    message,
    status: api?.status,
    code: api?.code,
  });

  if (api?.status === 429) {
    return {
      status: 429,
      body: {
        error: api.message ?? "Rate limit exceeded. Please wait and try again.",
        code: "rate_limit",
      },
    };
  }

  if (api?.status === 401) {
    return {
      status: 401,
      body: {
        error:
          api.message ??
          "OpenAI rejected the API key. Verify OPENAI_API_KEY in Vercel Production and redeploy.",
        code: "invalid_api_key",
      },
    };
  }

  if (api?.status === 400) {
    return {
      status: 400,
      body: {
        error: api.message ?? "Invalid chat request.",
        code: "invalid_request",
      },
    };
  }

  if (api?.status != null && api.status >= 400) {
    return {
      status: api.status,
      body: {
        error: api.message ?? `OpenAI API error (${api.status}).`,
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
