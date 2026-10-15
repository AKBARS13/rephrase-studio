import type { ProtectedKind, ProtectedSpan } from "../types.js";

const BUILTIN_PATTERNS: Array<[ProtectedKind, RegExp]> = [
  ["code", /```[\s\S]*?```|`[^`\n]+`/g],
  ["url", /\b(?:https?:\/\/|www\.)[^\s<>()]+/gi],
  ["citation", /\((?:[A-Z][\p{L}'-]+(?:\s+(?:et\s+al\.|&\s+[A-Z][\p{L}'-]+))?,?\s+\d{4}[a-z]?(?:;\s*)?)+\)|\[(?:\d+(?:\s*[-,]\s*\d+)*)\]/gu],
  ["quote", /“[^”]*”|"[^"\n]+"|‘[^’]*’|(?<![\p{L}\p{N}_])'[^'\n]+'(?![\p{L}\p{N}_])/gu],
  ["number", /\b[-+]?\d+(?:[.,]\d+)*(?:\s?(?:%|°C|kg|g|mg|km|m|cm|mm|ms|s|Hz|kHz|MHz|GB|MB))?\b/gi],
];

function escapeRegex(value: string): string { return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }

export function protectText(text: string, technicalTerms: string[] = [], properNames: string[] = []): { text: string; spans: ProtectedSpan[] } {
  const ranges: Array<{ start: number; end: number; value: string; kind: ProtectedKind }> = [];
  const addMatches = (regex: RegExp, kind: ProtectedKind) => {
    for (const match of text.matchAll(regex)) {
      const start = match.index!;
      const end = start + match[0].length;
      if (!ranges.some(r => start < r.end && end > r.start)) ranges.push({ start, end, value: match[0], kind });
    }
  };
  for (const [kind, regex] of BUILTIN_PATTERNS) addMatches(new RegExp(regex.source, regex.flags), kind);
  for (const term of technicalTerms.filter(Boolean).sort((a, b) => b.length - a.length)) addMatches(new RegExp(`\\b${escapeRegex(term)}\\b`, "giu"), "technical-term");
  for (const name of properNames.filter(Boolean).sort((a, b) => b.length - a.length)) addMatches(new RegExp(`\\b${escapeRegex(name)}\\b`, "gu"), "proper-name");

  ranges.sort((a, b) => a.start - b.start);
  const spans: ProtectedSpan[] = [];
  let cursor = 0;
  let output = "";
  for (const range of ranges) {
    const placeholder = `⟦RS_${spans.length}_${range.kind.toUpperCase().replace("-", "_")}⟧`;
    output += text.slice(cursor, range.start) + placeholder;
    spans.push({ placeholder, value: range.value, kind: range.kind });
    cursor = range.end;
  }
  return { text: output + text.slice(cursor), spans };
}

export function restoreText(text: string, spans: ProtectedSpan[]): { text: string; missing: ProtectedSpan[] } {
  let restored = text;
  const missing: ProtectedSpan[] = [];
  for (const span of spans) {
    const count = restored.split(span.placeholder).length - 1;
    if (count !== 1) missing.push(span);
    restored = restored.replace(span.placeholder, span.value);
  }
  return { text: restored, missing };
}
