import type { GenerationRequest, TextGenerator } from "../types.js";

/** API boundary. No provider credentials or SDK leak into rewrite engines. */
export class HttpTextGenerator implements TextGenerator {
  constructor(
    private readonly endpoint: string,
    private readonly fetchImpl: typeof fetch = fetch,
    private readonly headers: Record<string, string> = {},
  ) {}

  async generate(request: GenerationRequest): Promise<string> {
    const response = await this.fetchImpl.call(globalThis, this.endpoint, {
      method: "POST",
      headers: { "content-type": "application/json", ...this.headers },
      body: JSON.stringify(request),
    });
    if (!response.ok) {
      let message = `Generator API failed with HTTP ${response.status}`;
      try {
        const body = await response.json() as { error?: { message?: unknown } };
        if (typeof body.error?.message === "string") message += `: ${body.error.message}`;
      } catch { /* Keep the status-only message for non-JSON failures. */ }
      throw new Error(message);
    }
    const data = await response.json() as { text?: unknown };
    if (typeof data.text !== "string" || data.text.trim() === "") {
      throw new Error("Generator API returned no text");
    }
    return data.text;
  }
}

/** Deterministic adapter for tests and offline operation. */
export class FunctionTextGenerator implements TextGenerator {
  constructor(private readonly fn: (request: GenerationRequest) => string | Promise<string>) {}
  async generate(request: GenerationRequest): Promise<string> { return this.fn(request); }
}
