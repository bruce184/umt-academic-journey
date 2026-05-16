// src/server.js
// Entry point cho backend Express (ESM + top-level await)

import "dotenv/config";

// Dynamic import để tương thích cả:
// - export const app = ...;
// - export default app;
const appModule = await import("./app.js");
const app = appModule.app ?? appModule.default;

if (!app) {
  throw new Error(
    "Cannot initialize Express app from ./app.js (no export found)."
  );
}

// Lấy port từ app hoặc từ biến môi trường, fallback 3000
const port = app.get("port") ?? process.env.PORT ?? 3000;

const server = app.listen(port, "0.0.0.0", () => {
  console.log(`Server listening at http://localhost:${port}`);
});

export default server;
