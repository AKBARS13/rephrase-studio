import express, { type NextFunction, type Request, type Response } from "express";
import cors from "cors";
import type { AppConfig } from "./config/env.js";
import { generationRequestSchema } from "./validation/request.js";
import { GeminiService, listAvailableModels } from "./services/gemini.js";
import { ServiceError } from "./services/errors.js";
import { documentRouter } from "./routes/documents.js";

export function createApp(config: AppConfig, service?: GeminiService) {
  const app = express();
  app.disable("x-powered-by");
  app.use(cors({ origin: config.allowedOrigin, methods: ["GET", "POST"] }));
  app.use(express.json({ limit: "128kb" }));
  app.get("/api/health", (_req, res) => res.json({ status: "ok", provider: "gemini", configured: Boolean(config.apiKey || service), model: config.model }));
  app.use("/api/documents", documentRouter);
  app.get("/api/models", async (_req, res, next) => { try { res.json({ configuredModel: config.model, models: await listAvailableModels(config) }); } catch (e) { next(e); } });
  app.post("/api/rewrite", async (req, res, next) => {
    try {
      const parsed = generationRequestSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ error: { code: "invalid_request", message: "Permintaan parafrase tidak valid.", fields: parsed.error.flatten().fieldErrors } });
      if (parsed.data.source.length > config.maxInputChars || parsed.data.protectedText.length > config.maxInputChars * 1.5) throw new ServiceError("too_long", `Teks melampaui batas ${config.maxInputChars.toLocaleString("id-ID")} karakter.`, 413);
      const gemini = service ?? new GeminiService(config);
      const output = await gemini.rewrite(parsed.data);
      if (!output.validation.protectedElementsPreserved) throw new ServiceError("invalid_response", "Gemini melaporkan elemen terlindungi tidak dapat dipertahankan.", 502);
      res.json({ text: output.paraphrasedText, warnings: output.warnings, validation: output.validation, model: config.model });
    } catch (e) { next(e); }
  });
  app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
    if (error instanceof SyntaxError && "body" in error) return res.status(400).json({ error: { code: "invalid_json", message: "Body permintaan bukan JSON yang valid." } });
    if (typeof error === "object" && error !== null && "code" in error && error.code === "LIMIT_FILE_SIZE") return res.status(413).json({ error: { code: "file_too_large", message: "Ukuran file melebihi batas 10 MB." } });
    const e = error instanceof ServiceError ? error : new ServiceError("upstream", "Terjadi kesalahan pada backend.", 500);
    res.status(e.status).json({ error: { code: e.code, message: e.message } });
  });
  return app;
}
