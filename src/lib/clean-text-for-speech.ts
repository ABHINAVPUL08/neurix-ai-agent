/**
 * Strips markdown and formatting so Web Speech API reads natural sentences.
 */
export function cleanTextForSpeech(text: string): string {
  if (!text?.trim()) return "";

  let cleaned = text;

  // Fenced code blocks
  cleaned = cleaned.replace(/```[\s\S]*?```/g, " ");
  // Inline code
  cleaned = cleaned.replace(/`([^`]+)`/g, "$1");

  // Markdown links: [label](url) → label
  cleaned = cleaned.replace(/\[([^\]]+)\]\([^)]*\)/g, "$1");
  // Bare URLs (skip reading long URLs aloud)
  cleaned = cleaned.replace(/https?:\/\/\S+/gi, " ");

  // Headings (# ## ###)
  cleaned = cleaned.replace(/^#{1,6}\s+/gm, "");

  // Bold / italic
  cleaned = cleaned.replace(/\*\*([^*]+)\*\*/g, "$1");
  cleaned = cleaned.replace(/\*([^*\n]+)\*/g, "$1");
  cleaned = cleaned.replace(/__([^_]+)__/g, "$1");
  cleaned = cleaned.replace(/_([^_\n]+)_/g, "$1");

  // Remaining asterisks
  cleaned = cleaned.replace(/\*+/g, " ");

  // Bullet / list markers at line start
  cleaned = cleaned.replace(/^[\t ]*[-•*+]\s+/gm, "");
  cleaned = cleaned.replace(/^[\t ]*\d+[.)]\s+/gm, "");

  // Horizontal rules
  cleaned = cleaned.replace(/^[-_*]{3,}\s*$/gm, " ");

  // Stray hash symbols (not inside words)
  cleaned = cleaned.replace(/#/g, " ");

  // Blockquotes
  cleaned = cleaned.replace(/^>\s+/gm, "");

  // Line breaks → sentence pauses
  cleaned = cleaned.replace(/\r\n/g, "\n");
  cleaned = cleaned.replace(/\n{2,}/g, ". ");
  cleaned = cleaned.replace(/\n/g, ", ");

  // Normalize punctuation spacing
  cleaned = cleaned.replace(/\s+([,.;:!?])/g, "$1");
  cleaned = cleaned.replace(/([,.;:!?])(?=[A-Za-z])/g, "$1 ");
  cleaned = cleaned.replace(/\s{2,}/g, " ");
  cleaned = cleaned.replace(/\.{2,}/g, ".");
  cleaned = cleaned.replace(/,\s*,/g, ", ");

  return cleaned.trim();
}
