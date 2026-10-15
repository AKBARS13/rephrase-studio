import type { Language, RewriteIntensity } from "../types.js";

const ID_REPLACEMENTS: Array<[RegExp, string]> = [
  [/(^|(?<=[.!?]\s))(?:Selain itu|Lebih lanjut|Tambahan lagi),?\s*/gimu, "$1"],
  [/\bPerlu dicatat bahwa\s*/giu, ""],
  [/\bPada intinya,?\s*/giu, ""],
  [/\bke depannya\b/giu, "selanjutnya"],
  [/\bmemanfaatkan\b/giu, "menggunakan"],
  [/\bmemfasilitasi\b/giu, "membantu"],
  [/\blanskap\s+(pendidikan|penelitian|bisnis|teknologi|industri)\b/giu, "bidang $1"],
  [/\bkrusial\b/giu, "penting"],
];
const EN_REPLACEMENTS: Array<[RegExp, string]> = [
  [/\b(?:Here's the thing:|Let me be clear:?|It turns out that?)\s*/giu, ""],
  [/\b(?:At its core|At the end of the day),?\s*/giu, ""],
  [/\bmoving forward,?\s*/giu, ""],
  [/\bcircle back\b/giu, "revisit"],
  [/\bdeep dive\b/giu, "analysis"],
  [/\blean into\b/giu, "accept"],
  [/\bThe answer isn't ([^.!?]+)\.\s*It's ([^.!?]+)\./giu, "$2, rather than $1, is the answer."],
  [/\bThe answer is not ([^.!?]+)\.\s*It is ([^.!?]+)\./giu, "$2, rather than $1, is the answer."],
  [/\b([A-Z][\p{L}-]+)\.\s*([A-Z][\p{L}-]+)\.\s*([A-Z][\p{L}-]+)\.\s*You can only pick two\./gu, "$1, $2, and $3: you can only pick two."],
  [/—/gu, ","],
];

/** Conservative fallback. It intentionally does not attempt broad semantic rewriting. */
export function deterministicRewrite(text: string, language: Language, intensity: RewriteIntensity): string {
  let output = text;
  const replacements = language === "id" ? ID_REPLACEMENTS : EN_REPLACEMENTS;
  // Intensity controls model freedom, not whether explicit filler/style violations are fixed.
  // These replacements are deliberately local and meaning-preserving in every mode.
  void intensity;
  for (const [pattern, replacement] of replacements) output = output.replace(pattern, replacement);
  output = output.replace(/[ \t]{2,}/g, " ").replace(/\s+([,.;:!?])/g, "$1").trim();
  output = output.replace(/(^|[.!?]\s+)([a-zà-ÿ])/gu, (_m, lead:string, letter:string) => lead + letter.toUpperCase());
  return output;
}
