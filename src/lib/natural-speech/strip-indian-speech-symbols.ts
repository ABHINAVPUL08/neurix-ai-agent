/**
 * Remove symbols and punctuation that Indian TTS engines often read aloud
 * (e.g. "comma", "question mark", emoji names). English path is untouched.
 */
export function stripIndianSpeechSymbols(text: string): string {
  let out = text;

  // Emojis & pictographs
  out = out.replace(/[\u{1F300}-\u{1FAFF}\u2600-\u27BF]/gu, " ");

  // Common symbols / bullets / arrows (often read literally)
  out = out.replace(
    /[👍👎✅❌🔥💡⭐🙏😊🙂😀😁😂🤔💪✨🎯📌📎→←↑↓•·▪◦►▸●○■□★☆♦♣♠♥—–―…]/g,
    " ",
  );

  // Markdown / structural chars
  out = out.replace(/[#@$%^&*+=_|\\<>~`]/g, " ");
  out = out.replace(/["""''«»[\](){}]/g, " ");

  // Punctuation — space (pauses handled in speech-controller)
  out = out.replace(/[,;:.!?।…—–]/g, " ");
  // Standalone dashes / hyphens between words (keep in-word hyphens like follow-up)
  out = out.replace(/\s[-–—]\s/g, " ");

  // Stray slashes and backticks
  out = out.replace(/[/\\]/g, " ");

  out = out.replace(/\s{2,}/g, " ").trim();
  return out;
}
