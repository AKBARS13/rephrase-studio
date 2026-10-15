let app: ReturnType<(typeof import("../rephrase-studio-backend/src/app.js"))["createApp"]> | undefined;

export default async function handler(req: any, res: any) {
  if (!app) {
    const [{ createApp }, { readConfig }] = await Promise.all([
      import("../rephrase-studio-backend/src/app.js"),
      import("../rephrase-studio-backend/src/config/env.js"),
    ]);
    app = createApp(readConfig());
  }
  return app(req, res);
}
