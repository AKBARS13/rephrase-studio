import { createApp } from "../rephrase-studio-backend/src/app.ts";
import { readConfig } from "../rephrase-studio-backend/src/config/env.ts";
export default createApp(readConfig());
