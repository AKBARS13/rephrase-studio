import type { RuleFinding } from "../types.js";

export function findRegex(text: string, ruleId: string, regex: RegExp, message: string, severity: RuleFinding["severity"] = "warning"): RuleFinding[] {
  const flags = regex.flags.includes("g") ? regex.flags : regex.flags + "g";
  const matcher = new RegExp(regex.source, flags);
  return [...text.matchAll(matcher)].map(match => ({
    ruleId, severity, message, match: match[0], index: match.index,
  }));
}

export function sentenceLengths(text: string): number[] {
  return text.split(/(?<=[.!?])\s+/).filter(Boolean).map(s => (s.match(/[\p{L}\p{N}]+/gu) ?? []).length);
}

export function rhythmFindings(text: string, prefix: string): RuleFinding[] {
  const lengths = sentenceLengths(text);
  const findings: RuleFinding[] = [];
  for (let i = 0; i + 2 < lengths.length; i++) {
    const group = lengths.slice(i, i + 3);
    const max = Math.max(...group), min = Math.min(...group);
    if (max >= 4 && max - min <= Math.max(2, Math.round(max * 0.15))) {
      findings.push({ ruleId: `${prefix}.uniform-sentence-length`, severity: "info", message: "Tiga kalimat berurutan memiliki panjang yang hampir sama." });
      break;
    }
  }
  return findings;
}
