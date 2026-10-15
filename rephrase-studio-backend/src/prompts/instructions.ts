import type { ValidGenerationRequest } from "../validation/request.js";

export const LANGUAGE_INSTRUCTIONS = {
  id: `Anda menyunting teks bahasa Indonesia. Ikuti pola Anti AI Writer secara kontekstual: kurangi pembuka generik, klise, kosakata AI berulang, ritme monoton, parataxis, pola tiga yang dibuat-buat, dan pasif yang menyembunyikan pelaku. Jangan menghapus istilah teknis atau kata yang diperlukan oleh makna. Pada teks akademik, pertahankan hedging ilmiah dan pasif prosedural yang sah. Gunakan bahasa Indonesia yang konsisten.`,
  en: `You edit English prose. Apply Stop Slop contextually: remove throat-clearing, empty emphasis, business jargon, formulaic binary contrasts, manufactured fragments, vague declarations, false agency, and repetitive rhythm. Do not delete necessary technical language. In academic text, retain evidence-bearing adverbs, epistemic hedging, and legitimate procedural passive voice. Keep the output consistently in English.`,
} as const;

export const FACT_PROTECTION = `Preserve the exact claim, negation, modality, causal direction, conditions, limitations, conclusions, names, dates, quantities, units, and technical meaning. Do not add facts, examples, evidence, references, people, organizations, numbers, or specificity. High intensity permits broader restructuring only; it never permits factual change.`;
export const CITATION_PROTECTION = `Every placeholder in the form ⟦RS_number_KIND⟧ is immutable. Copy each placeholder exactly once, unchanged and in a logically equivalent position. Placeholders represent citations, direct quotations, URLs, code, numbers, names, or technical terms. Never invent a citation or reference.`;
export const OUTPUT_VALIDATION = `Before responding, compare the rewrite with the input. Check negation, degree of certainty, causality, conditions, conclusions, and every placeholder. If confidence is limited, set requiresHumanReview to true and explain briefly in notes. Return only data that follows the response schema.`;

const STYLE: Record<ValidGenerationRequest["style"], string> = {
  academic: "Formal academic prose. Preserve cautious claims and discipline-specific terminology; avoid contractions and second person unless present and necessary.",
  "lab-report": "Concise laboratory-report prose. Preserve procedures, measured results, units, sequence, and procedural passive voice where appropriate.",
  "technical-report": "Precise technical-report prose. Keep component names, requirements, constraints, and causal relationships exact.",
  formal: "Formal, direct prose with complete sentences and restrained wording.",
  professional: "Clear professional prose with direct actions and no sales jargon.",
  casual: "Natural conversational prose without adding claims or anecdotes.",
  general: "Clear general-audience prose using accessible but accurate wording.",
};
const INTENSITY = {
  light: "Make small local improvements. Preserve sentence order and structure where possible.",
  medium: "Change wording and sentence structure when useful, while retaining all propositions.",
  high: "Restructure more substantially, but preserve every proposition, qualifier, and protected element.",
} as const;

export function buildSystemInstruction(req: ValidGenerationRequest): string {
  return [LANGUAGE_INSTRUCTIONS[req.language], `STYLE RULE: ${STYLE[req.style]}`, `FACT AND MEANING RULE: ${FACT_PROTECTION}`, `CITATION AND PLACEHOLDER RULE: ${CITATION_PROTECTION}`, `OUTPUT VALIDATION RULE: ${OUTPUT_VALIDATION}`].join("\n\n");
}
export function buildInput(req: ValidGenerationRequest): string {
  const repair = req.previousCandidate ? `\nA previous attempt needs repair:\n${req.previousCandidate}\nValidation issues:\n${JSON.stringify(req.validationIssues ?? [])}` : "";
  const findings = (req.ruleFindings ?? []).filter(f => !f.exempt).map(f => ({ ruleId:f.ruleId, severity:f.severity, match:f.match, message:f.message }));
  return `Rewrite only the text inside <source>.\nIntensity: ${INTENSITY[req.intensity]}\nActive language rule summaries:\n${req.rules.map((r,i)=>`${i+1}. ${r}`).join("\n")}\nDetected source patterns to address contextually (do not alter protected or technically necessary language):\n${JSON.stringify(findings)}\n<source>\n${req.protectedText}\n</source>${repair}`;
}
