import test from "node:test";
import assert from "node:assert/strict";
import {
  RephraseStudioCore,
  IndonesianRewriteEngine,
  EnglishRewriteEngine,
  FunctionTextGenerator,
  detectLanguage,
  protectText,
} from "../dist/src/index.js";

const academic = { language: "id", style: "academic", intensity: "medium", maxRepairAttempts: 1 };

test("language detection distinguishes Indonesian and English", () => {
  assert.equal(detectLanguage("Hasil penelitian ini menunjukkan bahwa data tidak berubah.").language, "id");
  assert.equal(detectLanguage("The study shows that the results are stable.").language, "en");
});

test("protection covers citations, numbers, URLs, quotes, code, and glossary terms", () => {
  const source = 'Model CNN mencapai 92.5% (Siregar, 2024); lihat https://x.test dan `loss()` serta "data asli".';
  const result = protectText(source, ["CNN"], []);
  const kinds = new Set(result.spans.map(s => s.kind));
  for (const kind of ["citation", "number", "url", "code", "quote", "technical-term"]) assert.ok(kinds.has(kind), kind);
});

test("Indonesian engine preserves protected academic content", async () => {
  const engine = new IndonesianRewriteEngine();
  const source = "Selain itu, model CNN meningkatkan akurasi menjadi 92,5% (Siregar, 2024).";
  const result = await engine.rewrite(source, { ...academic, technicalTerms: ["CNN"] });
  assert.equal(result.text, "Model CNN meningkatkan akurasi menjadi 92,5% (Siregar, 2024).");
  assert.ok(result.validation.confident);
  assert.ok(result.protectedSpans.some(s => s.kind === "citation"));
  assert.ok(result.protectedSpans.some(s => s.kind === "technical-term"));
});

test("English engine removes Stop Slop opener and preserves facts", async () => {
  const engine = new EnglishRewriteEngine();
  const source = "Here's the thing: the BERT model reached 87% accuracy (Lee, 2023).";
  const result = await engine.rewrite(source, { language: "en", style: "technical-report", intensity: "medium", technicalTerms: ["BERT"] });
  assert.equal(result.text, "The BERT model reached 87% accuracy (Lee, 2023).");
  assert.ok(result.validation.confident);
  assert.equal(result.finalFindings.some(f => f.ruleId === "en.throat-clearing"), false);
});

test("manual language selection overrides detection", async () => {
  const core = new RephraseStudioCore();
  const result = await core.rewrite("Model Transformer diuji.", { language: "en", style: "formal", intensity: "light", technicalTerms: ["Transformer"] });
  assert.equal(result.language, "en");
  assert.equal(result.languageConfidence, 1);
});

test("validator warns when a generator changes negation", async () => {
  const generator = new FunctionTextGenerator(req => req.protectedText.replace("tidak ", ""));
  const engine = new IndonesianRewriteEngine(generator);
  const result = await engine.rewrite("Metode ini tidak mengubah hasil 12%.", academic);
  assert.equal(result.validation.confident, false);
  assert.ok(result.validation.issues.some(i => i.code === "meaning.negation"));
  assert.ok(result.warnings.some(w => w.includes("belum meyakinkan")));
});

test("missing citation placeholder is a blocking validation error", async () => {
  const generator = new FunctionTextGenerator(req => req.protectedText.replace(/⟦RS_\d+_CITATION⟧/, ""));
  const engine = new EnglishRewriteEngine(generator);
  const result = await engine.rewrite("The result remained stable (Lee, 2023).", { language: "en", style: "academic", intensity: "high", maxRepairAttempts: 0 });
  assert.equal(result.validation.confident, false);
  assert.ok(result.validation.issues.some(i => i.code === "protected.citation" || i.code === "protected.placeholder"));
});

test("academic mode does not flag legitimate passive as a style violation", async () => {
  const engine = new EnglishRewriteEngine();
  const result = await engine.rewrite("The samples were measured at 20°C.", { language: "en", style: "academic", intensity: "light" });
  assert.equal(result.finalFindings.some(f => f.ruleId === "en.passive"), false);
  assert.ok(result.text.includes("20°C"));
});
