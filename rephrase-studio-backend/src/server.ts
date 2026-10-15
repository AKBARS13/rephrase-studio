import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createApp } from "./app.js";
import { readConfig } from "./config/env.js";

const config = readConfig();
const app = createApp(config);
if (process.env.SERVE_FRONTEND === "true") {
  const here = path.dirname(fileURLToPath(import.meta.url));
  const frontend = path.resolve(process.env.FRONTEND_DIST || path.join(here, "../../rephrase-studio-web/dist"));
  app.use(express.static(frontend));
  app.get("/", (_req, res) => res.sendFile(path.join(frontend, "index.html")));
}
app.listen(config.port, "0.0.0.0", () => {
  console.log(`[rephrase-studio] backend listening on port ${config.port}; model=${config.model}; gemini=${config.apiKey ? "configured" : "not-configured"}; frontend=${process.env.SERVE_FRONTEND === "true" ? "served" : "separate"}`);
});
