import type { RuleFinding, TextGenerator, WritingStyle } from "../types.js";
import { BaseRewriteEngine } from "./base.js";
import { analyzeEnglish, ENGLISH_RULE_SUMMARY } from "../rules/english.js";

export class EnglishRewriteEngine extends BaseRewriteEngine {
  readonly language = "en" as const;
  protected readonly rules = ENGLISH_RULE_SUMMARY;
  constructor(generator?: TextGenerator) { super(generator); }
  protected analyzeRules(text: string, style: WritingStyle): RuleFinding[] { return analyzeEnglish(text, style); }
}
