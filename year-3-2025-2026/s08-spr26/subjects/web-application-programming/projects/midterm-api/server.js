/** server.js: main server file for the music playlist API */
import app from "./app.js";
import db from "./db/db.js";


const PORT = process.env.PORT || 23016;

async function start() {
  try {
    // check DB connection (Supabase)
    await db.raw("SELECT 1 as ok");
    console.log("Database connected.");
  } catch (e) {
    console.warn("Database connection failed; starting without DB:", e.message || e);
  }

  // start Express server (start even if DB check failed)
  app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
}

start();

/**
 * To run the server:
 * 1. Ensure you have Node.js installed.
 * 2. Install dependencies with `npm install`.
 * 3. Set up your environment variables in a `.env` file.
 * 4. Start the server with `npm run dev` for development or `npm start` for production.
 * The server will be accessible at `http://localhost:23016` by default.
 * 
 * What is this error below and how to fix it?: 
 * node:internal/modules/cjs/loader:1404
 * throw err;
 * ^
 * Error: Cannot find module 'D:\1.UMT\1.SUBJECTS\3.JUNIOR\SEM8\WEB-APPLICATION-PROGRAMMING\week05(05022026)\midterm\src\server.js'
    at Function._resolveFilename (node:internal/modules/cjs/loader:1401:15)
    at defaultResolveImpl (node:internal/modules/cjs/loader:1057:19)
    at resolveForCJSWithHooks (node:internal/modules/cjs/loader:1062:22)
    at Function._load (node:internal/modules/cjs/loader:1211:37)
    at TracingChannel.traceSync (node:diagnostics_channel:322:14)
    at wrapModuleLoad (node:internal/modules/cjs/loader:235:24)
    at Function.executeUserEntryPoint [as runMain] (node:internal/modules/run_main:171:5)
    at node:internal/main/run_main_module:36:49 {
  code: 'MODULE_NOT_FOUND',
  requireStack: []
}

* Node.js v22.17.1
Answer: This error indicates that Node.js is unable to locate the 'server.js' file in the specified directory. To fix this issue, ensure that:
1. The 'server.js' file exists in the 'src' directory of your project.
2. You are running the Node.js command from the correct directory where your project is located.
3. The file name and path are spelled correctly, including case sensitivity.
 */
