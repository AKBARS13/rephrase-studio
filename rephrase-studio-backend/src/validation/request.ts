import { z } from "zod";
export const generationRequestSchema = z.object({
  language: z.enum(["id", "en"]),
  source: z.string().min(1),
  protectedText: z.string().min(1),
  style: z.enum(["academic", "lab-report", "technical-report", "formal", "professional", "casual", "general"]),
  intensity: z.enum(["light", "medium", "high"]),
  rules: z.array(z.string().min(1)).max(20),
  previousCandidate: z.string().optional(),
  validationIssues: z.array(z.object({ code: z.string(), severity: z.enum(["warning", "error"]), message: z.string() })).max(20).optional(),
  ruleFindings: z.array(z.object({ ruleId: z.string(), severity: z.enum(["info", "warning", "error"]), message: z.string(), match: z.string().optional(), index: z.number().optional(), exempt: z.boolean().optional() })).max(50).optional(),
}).strict();
export type ValidGenerationRequest = z.infer<typeof generationRequestSchema>;

export const geminiOutputSchema = z.object({
  paraphrasedText: z.string().min(1),
  warnings: z.array(z.string()).max(10),
  validation: z.object({ meaningPreserved: z.boolean(), protectedElementsPreserved: z.boolean(), requiresHumanReview: z.boolean(), notes: z.array(z.string()).max(10) }),
}).strict();
export type GeminiOutput = z.infer<typeof geminiOutputSchema>;
