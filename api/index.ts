import { createApp } from "../rephrase-studio-backend/src/app.js";
import { readConfig } from "../rephrase-studio-backend/src/config/env.js";
export default createApp(readConfig());
