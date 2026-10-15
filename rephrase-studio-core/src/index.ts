import type { RewriteOptions, RewriteResult, TextGenerator } from "./types.js";
import { detectLanguage } from "./processing/language.js";
import { IndonesianRewriteEngine } from "./engines/indonesian.js";
import { EnglishRewriteEngine } from "./engines/english.js";

export * from "./types.js";
export * from "./api/generator.js";
export * from "./engines/indonesian.js";
export * from "./engines/english.js";
export * from "./processing/language.js";
export * from "./processing/protect.js";
export * from "./validation/meaning.js";
export * from "./integrity/types.js";
export * from "./integrity/check.js";

export class RephraseStudioCore {
  private readonly id: IndonesianRewriteEngine;
  private readonly en: EnglishRewriteEngine;
  constructor(generator?: TextGenerator) {
    this.id = new IndonesianRewriteEngine(generator);
    this.en = new EnglishRewriteEngine(generator);
  }

  async rewrite(text: string, options: RewriteOptions): Promise<RewriteResult> {
    const detected = detectLanguage(text);
    const language = options.language === "auto" ? detected.language : options.language;
    const confidence = options.language === "auto" ? detected.confidence : 1;
    return language === "id"
      ? this.id.rewrite(text, options, confidence)
      : this.en.rewrite(text, options, confidence);
  }
}
