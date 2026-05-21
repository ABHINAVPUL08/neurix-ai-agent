import { NextRequest, NextResponse } from "next/server";
import {
  APIError,
  AuthenticationError,
  BadRequestError,
  RateLimitError,
} from "groq-sdk";
import {
  buildDocumentAnalysisSystemPrompt,
  buildDocumentAnalysisUserMessage,
} from "@/lib/document-analysis-prompt";
import { extractTextFromDocument } from "@/lib/document-extractor";
import {
  detectDocumentType,
  MAX_DOCUMENT_SIZE_BYTES,
} from "@/lib/document-types";
import { GROQ_MODEL, GROQ_TEMPERATURE } from "@/lib/constants";
import { logger } from "@/lib/logger";
import { getGroqClient } from "@/lib/groq";

export const runtime = "nodejs";
export const maxDuration = 60;

const ANALYSIS_MAX_TOKENS = 3072;

type ErrorPayload = { error: string; code?: string };

function resolveGroqError(error: unknown): { status: number; body: ErrorPayload } {
  if (error instanceof RateLimitError) {
    return {
      status: 429,
      body: {
        error: "Rate limit exceeded. Please try again shortly.",
        code: "rate_limit",
      },
    };
  }
  if (error instanceof AuthenticationError) {
    return {
      status: 401,
      body: { error: "Invalid Groq API key.", code: "invalid_api_key" },
    };
  }
  if (error instanceof BadRequestError) {
    return {
      status: 400,
      body: {
        error: error.message || "Invalid request.",
        code: "invalid_request",
      },
    };
  }
  if (error instanceof APIError) {
    return {
      status: error.status ?? 502,
      body: {
        error: error.message || "AI analysis failed.",
        code: "groq_api_error",
      },
    };
  }

  const message =
    error instanceof Error ? error.message : "Internal server error";

  if (message.includes("GROQ_API_KEY")) {
    return { status: 503, body: { error: message, code: "missing_api_key" } };
  }

  return { status: 500, body: { error: message, code: "internal_error" } };
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "A document file is required.", code: "invalid_request" },
        { status: 400 },
      );
    }

    if (file.size > MAX_DOCUMENT_SIZE_BYTES) {
      return NextResponse.json(
        {
          error: "File too large. Maximum size is 4 MB.",
          code: "file_too_large",
        },
        { status: 400 },
      );
    }

    const fileType = detectDocumentType(file.type, file.name);
    if (!fileType) {
      return NextResponse.json(
        {
          error: "Unsupported file type. Upload PDF, DOCX, or TXT.",
          code: "invalid_file_type",
        },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    let extracted;
    try {
      extracted = await extractTextFromDocument(
        buffer,
        file.type,
        file.name,
      );
    } catch (extractErr) {
      logger.error("analyze-document", extractErr);
      return NextResponse.json(
        {
          error:
            "Could not read this document. Try a smaller PDF, DOCX, or TXT file.",
          code: "extraction_failed",
        },
        { status: 422 },
      );
    }

    const groq = getGroqClient();

    const completion = await groq.chat.completions.create({
      model: GROQ_MODEL,
      temperature: GROQ_TEMPERATURE,
      max_tokens: ANALYSIS_MAX_TOKENS,
      messages: [
        { role: "system", content: buildDocumentAnalysisSystemPrompt() },
        {
          role: "user",
          content: buildDocumentAnalysisUserMessage(
            file.name,
            extracted.fileType,
            extracted.text,
            extracted.truncated,
          ),
        },
      ],
    });

    const analysis = completion.choices[0]?.message?.content?.trim();

    if (!analysis) {
      return NextResponse.json(
        { error: "No analysis generated.", code: "empty_response" },
        { status: 502 },
      );
    }

    return NextResponse.json({
      analysis,
      meta: {
        filename: file.name,
        fileType: extracted.fileType,
        charCount: extracted.charCount,
        truncated: extracted.truncated,
      },
    });
  } catch (error) {
    logger.error("analyze-document", error);
    const { status, body } = resolveGroqError(error);
    return NextResponse.json(body, { status });
  }
}
