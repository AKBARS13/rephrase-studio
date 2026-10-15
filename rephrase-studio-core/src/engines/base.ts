import type { GenerationRequest, Language, RewriteOptions, RewriteResult, RuleFinding, TextGenerator, WritingStyle } from "../types.js";
import { protectText, restoreText } from "../processing/protect.js";
import { validateMeaning } from "../validation/meaning.js";
import { deterministicRewrite } from "../processing/deterministic.js";

export abstract class BaseRewriteEngine {
  abstract readonly language: Language;
  protected abstract readonly rules: string[];
  protected abstract analyzeRules(text: string, style: WritingStyle): RuleFinding[];

  constructor(private readonly generator?: TextGenerator) {}

  async rewrite(source: string, options: RewriteOptions, languageConfidence = 1): Promise<RewriteResult> {
    if (!source.trim()) throw new Error("Text must not be empty");
    const protectedData = protectText(source, options.technicalTerms, options.properNames);
    const sourceFindings = this.analyzeRules(source, options.style);
    const maxRepairs = Math.max(0, Math.min(options.maxRepairAttempts ?? 1, 2));
    let protectedCandidate = "";
    let restored = { text: source, missing: [] as typeof protectedData.spans };
    let validation = validateMeaning(source, source, this.language, protectedData.spans);
    let finalFindings: RuleFinding[] = sourceFindings;
    let attempts = 0;

    while (attempts <= maxRepairs) {
      attempts++;
      const request: GenerationRequest = {
        language: this.language,
        source,
        protectedText: protectedData.text,
        style: options.style,
        intensity: options.intensity,
        rules: this.rules,
        previousCandidate: attempts > 1 ? protectedCandidate : undefined,
        validationIssues: attempts > 1 ? validation.issues : undefined,
        ruleFindings: attempts > 1 ? finalFindings : sourceFindings,
      };
      protectedCandidate = this.generator
        ? await this.generator.generate(request)
        : deterministicRewrite(protectedData.text, this.language, options.intensity);
      restored = restoreText(protectedCandidate, protectedData.spans);
      validation = validateMeaning(source, restored.text, this.language, protectedData.spans, restored.missing);
      finalFindings = this.analyzeRules(restored.text, options.style);
      const blockingStyleIssues = finalFindings.filter(f => f.severity === "error");
      if (validation.confident && blockingStyleIssues.length === 0) break;
    }

    const warnings = validation.issues.map(i => i.message);
    if (finalFindings.length >= sourceFindings.length && sourceFindings.length > 0) warnings.push("Sebagian pola gaya masih terdeteksi; periksa temuan sebelum menerima hasil.");
    if (languageConfidence < 0.7) warnings.push("Deteksi bahasa kurang meyakinkan; pilih bahasa secara manual.");
    if (!validation.confident) warnings.push("Validasi makna belum meyakinkan. Jangan gunakan hasil tanpa pemeriksaan manusia.");

    return {
      source, text: restored.text, language: this.language, languageConfidence,
      style: options.style, intensity: options.intensity,
      protectedSpans: protectedData.spans, sourceFindings, finalFindings,
      validation, warnings: [...new Set(warnings)], attempts,
    };
  }
}
