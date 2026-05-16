// app.js
import express from "express";
import cors from "cors";

import { correlationId } from "./middlewares/correlationId.js";
import { requestLogger } from "./middlewares/requestLogger.js";
import { apiLimiter } from "./middlewares/rateLimit.js";
import { responseHelpers } from "./middlewares/response.js";
import { errorHandler } from "./middlewares/errorHandler.js";

import healthRouter from "./routers/healthRouter.js";
import userRouter from "./routers/userRouter.js";
import todoRouter from "./routers/todoRouter.js";

const app = express();

app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.use(correlationId);
app.use(requestLogger);
app.use(apiLimiter);
app.use(responseHelpers);

// Routes
app.use(healthRouter);

app.use("/api/v1/users", userRouter);
app.use("/api/v1/todos", todoRouter);

app.use((req, res) => {
  return res.error(
    { message: `Can't find ${req.originalUrl} on this server!` },
    404
  );
});

app.use(errorHandler);

export default app;
