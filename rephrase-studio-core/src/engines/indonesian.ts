import type { RuleFinding, TextGenerator, WritingStyle } from "../types.js";
import { BaseRewriteEngine } from "./base.js";
import { analyzeIndonesian, INDONESIAN_RULE_SUMMARY } from "../rules/indonesian.js";

export class IndonesianRewriteEngine extends BaseRewriteEngine {
  readonly language = "id" as const;
  protected readonly rules = INDONESIAN_RULE_SUMMARY;
  constructor(generator?: TextGenerator) { super(generator); }
  protected analyzeRules(text: string, style: WritingStyle): RuleFinding[] { return analyzeIndonesian(text, style); }
}
