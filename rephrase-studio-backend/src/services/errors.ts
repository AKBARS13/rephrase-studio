export type ServiceErrorCode = "missing_key"|"invalid_key"|"model_unavailable"|"too_long"|"empty_response"|"invalid_response"|"rate_limit"|"timeout"|"network"|"upstream";
export class ServiceError extends Error { constructor(public code: ServiceErrorCode, message: string, public status: number, public details?: unknown) { super(message); } }
export function classifyGeminiError(error: unknown, model: string): ServiceError {
  if (error instanceof ServiceError) return error;
  const e = error as { status?: number; code?: number|string; message?: string; name?: string };
  const message = e?.message || "Unknown Gemini API error"; const status = Number(e?.status ?? e?.code);
  if (status === 401 || status === 403 || /api.?key.*(?:invalid|expired)|unauthenticated|permission_denied/i.test(message)) return new ServiceError("invalid_key", "GEMINI_API_KEY ditolak. Periksa key dan izin proyek pada backend.", 503);
  if (status === 404 || /model.*(?:not found|not available)|not_found/i.test(message)) return new ServiceError("model_unavailable", `Model ${model} tidak tersedia untuk API key ini. Periksa GEMINI_MODEL atau daftar model akun.`, 503);
  if (status === 429 || /resource_exhausted|rate.?limit|quota/i.test(message)) return new ServiceError("rate_limit", "Batas permintaan atau kuota Gemini tercapai. Tunggu lalu coba lagi.", 429);
  if (status === 408 || /timeout|timed out|abort/i.test(message)) return new ServiceError("timeout", "Gemini tidak merespons dalam batas waktu.", 504);
  if (/fetch failed|econn|enotfound|network|socket/i.test(message)) return new ServiceError("network", "Backend tidak dapat terhubung ke Gemini. Periksa jaringan lalu coba lagi.", 503);
  return new ServiceError("upstream", "Gemini gagal memproses permintaan.", 502);
}
