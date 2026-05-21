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
import {
  logAnalyzeDocument,
  logAnalyzeDocumentError,
} from "@/lib/analyze-document-log";
import { extractTextFromDocument } from "@/lib/document-extractor";
import { detectDocumentType } from "@/lib/document-types";
import { getMaxUploadBytes, getMaxUploadLabel } from "@/lib/env";
import { GROQ_MODEL, GROQ_TEMPERATURE } from "@/lib/constants";
import { getGroqClient } from "@/lib/groq";

export const runtime = "nodejs";
export const maxDuration = 90;

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
      body: {
        error: "Invalid Groq API key. Check GROQ_API_KEY in Vercel environment variables.",
        code: "invalid_api_key",
      },
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
    return {
      status: 503,
      body: {
        error:
          "GROQ_API_KEY is not configured. Add it in Vercel → Project → Settings → Environment Variables.",
        code: "missing_api_key",
      },
    };
  }

  return { status: 500, body: { error: message, code: "internal_error" } };
}

export async function POST(request: NextRequest) {
  const maxBytes = getMaxUploadBytes();

  try {
    logAnalyzeDocument("upload_received", {
      vercel: process.env.VERCEL === "1",
      node: process.version,
      maxUploadMb: Math.round(maxBytes / (1024 * 1024)),
      groqConfigured: Boolean(process.env.GROQ_API_KEY?.trim()),
    });

    let formData: FormData;
    try {
      formData = await request.formData();
    } catch (formErr) {
      logAnalyzeDocumentError("formdata_parse_failed", formErr);
      return NextResponse.json(
        {
          error: "Could not read upload. Try a smaller PDF or refresh the page.",
          code: "formdata_error",
        },
        { status: 400 },
      );
    }

    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      logAnalyzeDocument("validation_failed", { reason: "missing_file" });
      return NextResponse.json(
        { error: "A document file is required.", code: "invalid_request" },
        { status: 400 },
      );
    }

    logAnalyzeDocument("file_meta", {
      name: file.name,
      size: file.size,
      type: file.type || "unknown",
    });

    if (file.size === 0) {
      return NextResponse.json(
        { error: "The uploaded file is empty.", code: "empty_file" },
        { status: 400 },
      );
    }

    if (file.size > maxBytes) {
      return NextResponse.json(
        {
          error: `File too large. Maximum size is ${getMaxUploadLabel()} on this deployment.`,
          code: "file_too_large",
        },
        { status: 413 },
      );
    }

    const fileType = detectDocumentType(file.type, file.name);
    if (!fileType) {
      return NextResponse.json(
        {
          error:
            "Unsupported file type. Upload PDF, DOCX, TXT, or image (PNG/JPG/WebP).",
          code: "invalid_file_type",
        },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    logAnalyzeDocument("buffer_ready", { bytes: buffer.length });

    let extracted;
    try {
      extracted = await extractTextFromDocument(
        buffer,
        file.type,
        file.name,
      );
      logAnalyzeDocument("parser_result", {
        fileType: extracted.fileType,
        extractionMethod: extracted.extractionMethod,
        charCount: extracted.charCount,
        truncated: extracted.truncated,
        preview: extracted.text.slice(0, 120),
      });
    } catch (extractErr) {
      logAnalyzeDocumentError("extraction_failed", extractErr, {
        fileType,
        fileName: file.name,
      });
      const msg =
        extractErr instanceof Error
          ? extractErr.message
          : "Could not read this document.";
      return NextResponse.json(
        {
          error:
            msg.includes("Unsupported") || msg.includes("extract")
              ? msg
              : "Could not read this document. Try a text-based or scanned PDF, DOCX, TXT, or a clear image.",
          code: "extraction_failed",
        },
        { status: 422 },
      );
    }

    const groq = getGroqClient();
    logAnalyzeDocument("groq_request_start", { model: GROQ_MODEL });

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
      logAnalyzeDocument("groq_empty_response");
      return NextResponse.json(
        { error: "No analysis generated.", code: "empty_response" },
        { status: 502 },
      );
    }

    logAnalyzeDocument("ai_response_ok", {
      analysisLength: analysis.length,
      preview: analysis.slice(0, 80),
    });

    return NextResponse.json({
      analysis,
      meta: {
        filename: file.name,
        fileType: extracted.fileType,
        charCount: extracted.charCount,
        truncated: extracted.truncated,
        extractionMethod: extracted.extractionMethod,
      },
    });
  } catch (error) {
    logAnalyzeDocumentError("final_error", error);
    const { status, body } = resolveGroqError(error);
    return NextResponse.json(body, { status });
  }
}
