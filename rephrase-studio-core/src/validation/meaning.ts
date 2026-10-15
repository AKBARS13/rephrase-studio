import type { Language, ProtectedSpan, ValidationIssue, ValidationReport } from "../types.js";

const NEGATIONS = {
  id: /\b(?:tidak|bukan|belum|tanpa|jangan)\b/gi,
  en: /\b(?:not|no|never|without|neither|nor|cannot|can't|don't|doesn't|didn't)\b/gi,
};
const MODALS = {
  id: /\b(?:dapat|bisa|mungkin|diperkirakan|diduga|harus|wajib)\b/gi,
  en: /\b(?:may|might|could|can|must|should|likely|possibly)\b/gi,
};

function count(text: string, regex: RegExp): number { return (text.match(regex) ?? []).length; }
function normalizeTokens(text: string): Set<string> {
  return new Set((text.toLowerCase().match(/[\p{L}]{4,}/gu) ?? []).filter(w => !["yang", "dengan", "untuk", "this", "that", "with", "from", "have"].includes(w)));
}

export function validateMeaning(source: string, candidate: string, language: Language, spans: ProtectedSpan[], missingPlaceholders: ProtectedSpan[] = []): ValidationReport {
  const issues: ValidationIssue[] = [];
  for (const span of spans) {
    if (!candidate.includes(span.value)) issues.push({ code: `protected.${span.kind}`, severity: "error", message: `Elemen terlindungi berubah atau hilang: ${span.value}` });
  }
  for (const span of missingPlaceholders) issues.push({ code: "protected.placeholder", severity: "error", message: `Placeholder ${span.kind} hilang atau terduplikasi saat pemrosesan.` });
  if (count(source, NEGATIONS[language]) !== count(candidate, NEGATIONS[language])) issues.push({ code: "meaning.negation", severity: "error", message: "Jumlah penanda negasi berubah; makna mungkin bergeser." });
  if (count(source, MODALS[language]) !== count(candidate, MODALS[language])) issues.push({ code: "meaning.modality", severity: "warning", message: "Penanda kepastian/kewajiban berubah; periksa kekuatan klaim." });

  const sourceTokens = normalizeTokens(source);
  const candidateTokens = normalizeTokens(candidate);
  const overlap = sourceTokens.size === 0 ? 1 : [...sourceTokens].filter(t => candidateTokens.has(t)).length / sourceTokens.size;
  if (overlap < 0.35) issues.push({ code: "meaning.low-lexical-anchor", severity: "warning", message: "Kandidat berubah jauh dari sumber; pemeriksaan manusia diperlukan." });
  const penalty = issues.reduce((sum, i) => sum + (i.severity === "error" ? 35 : 15), 0);
  return { confident: !issues.some(i => i.severity === "error") && overlap >= 0.35, score: Math.max(0, 100 - penalty), issues };
}
