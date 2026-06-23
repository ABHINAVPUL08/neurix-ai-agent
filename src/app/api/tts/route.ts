import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import {
  MAX_TTS_INPUT_CHARS,
  OPENAI_TTS_MODEL,
  OPENAI_TTS_SPEED,
  OPENAI_TTS_VOICE,
} from "@/lib/natural-speech/tts-config";
import { logger } from "@/lib/logger";
import { readOpenAiApiKey } from "@/lib/server-env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

type TtsBody = {
  text?: string;
  language?: string;
};

export async function POST(request: NextRequest) {
  try {
    const apiKey = readOpenAiApiKey();
    if (!apiKey) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY is not configured.", code: "missing_api_key" },
        { status: 503 },
      );
    }

    const body = (await request.json()) as TtsBody;
    const text = typeof body.text === "string" ? body.text.trim() : "";

    if (!text) {
      return NextResponse.json(
        { error: "Text is required.", code: "invalid_request" },
        { status: 400 },
      );
    }

    if (text.length > MAX_TTS_INPUT_CHARS) {
      return NextResponse.json(
        { error: "Text is too long for speech.", code: "text_too_long" },
        { status: 413 },
      );
    }

    const openai = new OpenAI({ apiKey });
    const speech = await openai.audio.speech.create({
      model: OPENAI_TTS_MODEL,
      voice: OPENAI_TTS_VOICE,
      input: text,
      response_format: "mp3",
      speed: OPENAI_TTS_SPEED,
    });

    const buffer = Buffer.from(await speech.arrayBuffer());

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (error) {
    logger.error("[tts] failed", error);
    const message =
      error instanceof Error ? error.message : "Speech generation failed.";
    return NextResponse.json(
      { error: message, code: "tts_failed" },
      { status: 502 },
    );
  }
}
