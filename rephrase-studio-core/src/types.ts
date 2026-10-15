export type Language = "id" | "en";
export type LanguageSelection = Language | "auto";
export type WritingStyle =
  | "academic"
  | "lab-report"
  | "technical-report"
  | "formal"
  | "professional"
  | "casual"
  | "general";
export type RewriteIntensity = "light" | "medium" | "high";

export interface RewriteOptions {
  language: LanguageSelection;
  style: WritingStyle;
  intensity: RewriteIntensity;
  technicalTerms?: string[];
  properNames?: string[];
  maxRepairAttempts?: number;
}

export type ProtectedKind =
  | "url" | "code" | "citation" | "quote" | "number"
  | "technical-term" | "proper-name";

export interface ProtectedSpan {
  placeholder: string;
  value: string;
  kind: ProtectedKind;
}

export interface RuleFinding {
  ruleId: string;
  severity: "info" | "warning" | "error";
  message: string;
  match?: string;
  index?: number;
  exempt?: boolean;
}

export interface ValidationIssue {
  code: string;
  severity: "warning" | "error";
  message: string;
}

export interface ValidationReport {
  confident: boolean;
  score: number;
  issues: ValidationIssue[];
}

export interface RewriteResult {
  source: string;
  text: string;
  language: Language;
  languageConfidence: number;
  style: WritingStyle;
  intensity: RewriteIntensity;
  protectedSpans: ProtectedSpan[];
  sourceFindings: RuleFinding[];
  finalFindings: RuleFinding[];
  validation: ValidationReport;
  warnings: string[];
  attempts: number;
}

export interface GenerationRequest {
  language: Language;
  source: string;
  protectedText: string;
  style: WritingStyle;
  intensity: RewriteIntensity;
  rules: string[];
  previousCandidate?: string;
  validationIssues?: ValidationIssue[];
  ruleFindings?: RuleFinding[];
}

export interface TextGenerator {
  generate(request: GenerationRequest): Promise<string>;
}
