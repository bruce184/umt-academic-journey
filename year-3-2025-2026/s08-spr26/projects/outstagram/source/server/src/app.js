import express from "express";
import cors from "cors";
import routes from "./routes/index.js";
import { env } from "./config/env.js";
import { requestId } from "./middlewares/request-id.js";
import { responseMiddleware } from "./middlewares/response.js";
import { errorHandler } from "./middlewares/error.js";

const app = express();

const defaultDevOrigins = ["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:5174", "http://127.0.0.1:5174", "http://localhost:5175", "http://127.0.0.1:5175"];
const corsOrigins = (env.CORS_ORIGINS || "")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);

const resolvedOrigins = corsOrigins.length
    ? corsOrigins
    : env.NODE_ENV === "production"
        ? (env.WEB_BASE_URL ? [env.WEB_BASE_URL] : [])
        : defaultDevOrigins;

const allowAllOrigins = resolvedOrigins.length === 0;

const corsOptions = {
    origin: (origin, callback) => {
        if (!origin || allowAllOrigins) return callback(null, true);
        if (resolvedOrigins.includes(origin)) return callback(null, true);
        return callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(express.json({ limit: "2mb" }));
app.use(requestId);
app.use(responseMiddleware);

app.get("/health", (req, res) => res.ok({ status: "ok" }));

app.use("/api", routes);
app.use(errorHandler);

export default app;
