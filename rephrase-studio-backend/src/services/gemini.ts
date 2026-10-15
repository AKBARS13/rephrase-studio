import { GoogleGenAI } from "@google/genai";
import type { AppConfig } from "../config/env.js";
import { buildInput, buildSystemInstruction } from "../prompts/instructions.js";
import { geminiOutputSchema, type GeminiOutput, type ValidGenerationRequest } from "../validation/request.js";
import { classifyGeminiError, ServiceError } from "./errors.js";

export interface InteractionClient {
  create(params: Record<string, unknown>, options?: { timeout?: number }): Promise<{ output_text?: string | null }>;
}

const RESPONSE_SCHEMA = {
  type: "object", additionalProperties: false,
  properties: {
    paraphrasedText: { type: "string", description: "Rewritten text with every placeholder copied exactly once." },
    warnings: { type: "array", items: { type: "string" }, description: "Short user-facing warnings." },
    validation: { type: "object", additionalProperties: false, properties: {
      meaningPreserved: { type: "boolean" }, protectedElementsPreserved: { type: "boolean" },
      requiresHumanReview: { type: "boolean" }, notes: { type: "array", items: { type: "string" } },
    }, required: ["meaningPreserved", "protectedElementsPreserved", "requiresHumanReview", "notes"] },
  }, required: ["paraphrasedText", "warnings", "validation"],
};

export class GeminiService {
  private readonly client: InteractionClient;
  constructor(private readonly config: AppConfig, client?: InteractionClient) {
    if (client) this.client = client;
    else {
      if (!config.apiKey) throw new ServiceError("missing_key", "GEMINI_API_KEY belum dikonfigurasi pada backend.", 503);
      const ai = new GoogleGenAI({ apiKey: config.apiKey });
      this.client = ai.interactions as unknown as InteractionClient;
    }
  }

  async rewrite(req: ValidGenerationRequest): Promise<GeminiOutput> {
    try {
      const interaction = await this.client.create({
        model: this.config.model,
        system_instruction: buildSystemInstruction(req),
        input: buildInput(req),
        generation_config: { temperature: req.intensity === "high" ? 0.45 : 0.25 },
        response_format: { type: "text", mime_type: "application/json", schema: RESPONSE_SCHEMA },
      }, { timeout: this.config.timeoutMs });
      const text = interaction.output_text?.trim();
      if (!text) throw new ServiceError("empty_response", "Gemini mengembalikan respons kosong.", 502);
      let parsed: unknown;
      try { parsed = JSON.parse(text); }
      catch { throw new ServiceError("invalid_response", "Respons Gemini bukan JSON yang valid.", 502); }
      const result = geminiOutputSchema.safeParse(parsed);
      if (!result.success) throw new ServiceError("invalid_response", "Respons Gemini tidak sesuai format parafrase yang diwajibkan.", 502, result.error.issues);
      return result.data;
    } catch (error) { throw classifyGeminiError(error, this.config.model); }
  }
}

export async function listAvailableModels(config: AppConfig): Promise<string[]> {
  if (!config.apiKey) throw new ServiceError("missing_key", "GEMINI_API_KEY belum dikonfigurasi pada backend.", 503);
  try {
    const ai = new GoogleGenAI({ apiKey: config.apiKey });
    const pager = await ai.models.list({ config: { pageSize: 100 } });
    const names: string[] = [];
    for await (const model of pager) if (model.name) names.push(model.name.replace(/^models\//, ""));
    return names;
  } catch (error) { throw classifyGeminiError(error, config.model); }
}
