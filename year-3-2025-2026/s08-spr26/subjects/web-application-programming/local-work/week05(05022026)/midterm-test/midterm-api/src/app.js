import express from "express";
import cors from "cors";
import morgan from "morgan";
import "dotenv/config";

import routes from "./routes/index.js";
import responseFormatter from "./middlewares/response-mw.js";
import { requestId } from "./middlewares/request-id.js";
import { notFound, errorHandler } from "./middlewares/error-mw.js";

const app = express();

// 1) Core middlewares
app.use(cors());
app.use(express.json());

// 2) RequestId & Logging
app.use(requestId);
morgan.token("rid", (req) => req.requestId);
app.use(morgan(":method :url :status :response-time ms - rid=:rid"));

// 3) Response helpers
app.use(responseFormatter());

// 4) Routes
app.use("/api/v1", routes);

// 5) Docs (Placeholder for now)
// if (process.env.ENABLE_DOCS === "true") { ... }

// 6) Error handling
app.use(notFound);
app.use(errorHandler);

export default app;
