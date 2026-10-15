export interface AppConfig {
  apiKey?: string;
  model: string;
  port: number;
  timeoutMs: number;
  maxInputChars: number;
  allowedOrigin: string;
}
function positiveInt(value: string | undefined, fallback: number): number {
  const n = Number(value); return Number.isInteger(n) && n > 0 ? n : fallback;
}
export function readConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
  return {
    apiKey: env.GEMINI_API_KEY?.trim() || undefined,
    model: env.GEMINI_MODEL?.trim() || "gemini-3.8-flash",
    port: positiveInt(env.PORT, 3001), timeoutMs: positiveInt(env.REQUEST_TIMEOUT_MS, 45_000),
    maxInputChars: positiveInt(env.MAX_INPUT_CHARS, 12_000), allowedOrigin: env.ALLOWED_ORIGIN?.trim() || "http://localhost:5173",
  };
}
