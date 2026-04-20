/** app.js: Sets up Express server, middleware, and routes */
import express from "express";
import cors from "cors";
import responseFormatter from "./middlewares/response-mw.js";
import { notFound, errorHandler } from "./middlewares/error-mw.js";

const app = express();

// 1) core middlewares
app.use(cors());
app.use(express.json());

// 2) response helpers (res.ok/res.created/...)
app.use(responseFormatter());

// 3) routes
app.use("/api/v1", (await import("./routes/index.js")).default.playlistRoutes);

// 4) 404 + error handler
app.use(notFound);
app.use(errorHandler);

export default app;
