import type { SpeechLanguage } from "@/lib/natural-speech/detect-speech-language";
import { stripIndianSpeechSymbols } from "@/lib/natural-speech/strip-indian-speech-symbols";

const MIN_CHUNK_CHARS = 24;
const MAX_CHUNK_CHARS_EN = 300;
/** Larger chunks = fewer stop-start gaps → more human, flowing Hinglish */
const MAX_CHUNK_CHARS_IN = 300;
const SINGLE_UTTERANCE_MAX_IN = 420;

function normalizeChunk(value: string): string {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
}

function mergeParts(parts: string[], maxChars: number): string[] {
  const merged: string[] = [];
  let buffer = "";

  for (const part of parts) {
    if (!part) continue;
    const candidate = buffer ? `${buffer} ${part}` : part;
    if (
      buffer &&
      (buffer.length < MIN_CHUNK_CHARS || candidate.length <= maxChars)
    ) {
      buffer = candidate;
      continue;
    }
    if (buffer) merged.push(buffer);
    buffer = part;
  }
  if (buffer) merged.push(buffer);
  return merged;
}

function dedupeChunks(chunks: string[]): string[] {
  const deduped: string[] = [];
  for (const chunk of chunks) {
    const prev = deduped[deduped.length - 1];
    if (prev && normalizeChunk(prev) === normalizeChunk(chunk)) continue;
    deduped.push(chunk);
  }
  return deduped;
}

/** Split cleaned prose into speakable chunks with natural sentence boundaries. */
export function chunkTextForSpeech(
  text: string,
  language: SpeechLanguage = "english",
): string[] {
  const trimmed = text.trim();
  if (!trimmed) return [];

  const maxChars =
    language === "english" ? MAX_CHUNK_CHARS_EN : MAX_CHUNK_CHARS_IN;

  if (language === "hinglish" || language === "hindi") {
    const cleaned = stripIndianSpeechSymbols(trimmed);
    if (!cleaned) return [];

    // Short replies: one continuous utterance (most natural for clients)
    if (cleaned.length <= SINGLE_UTTERANCE_MAX_IN) {
      return [cleaned];
    }

    const rawParts =
      trimmed
        .match(/[^.!?।]+(?:[.!?।]+|$)/g)
        ?.map((p) => p.trim())
        .filter(Boolean) ?? [trimmed];

    const merged = mergeParts(
      rawParts.map(stripIndianSpeechSymbols).filter((c) => c.length > 0),
      MAX_CHUNK_CHARS_IN,
    );
    return dedupeChunks(merged);
  }

  const rawParts =
    trimmed
      .match(/[^.!?]+(?:[.!?]+|$)/g)
      ?.map((p) => p.trim())
      .filter(Boolean) ?? [trimmed];

  return dedupeChunks(mergeParts(rawParts, maxChars));
}
