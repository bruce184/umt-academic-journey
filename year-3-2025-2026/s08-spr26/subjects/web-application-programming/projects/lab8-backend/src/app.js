import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";

import apiRoutes from "./routes/index.js";
import { errorMw, notFoundMw } from "./middlewares/error-mw.js";

dotenv.config();

const app = express();

// Security headers cơ bản
app.use(helmet());

// Cho frontend gọi API
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
  })
);

// Parse JSON body
app.use(express.json());

// Log request ra terminal
app.use(morgan("dev"));

// Prefix API, ví dụ /api
const apiPrefix = process.env.APP_PREFIX || "/api";

// Mount tất cả API routes
app.use(apiPrefix, apiRoutes);

// 404 nếu route không tồn tại
app.use(notFoundMw);

// Error handler tổng
app.use(errorMw);

export default app;