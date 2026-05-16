import { ApiError, errors } from "../utils/api-error.js";
import { sendError } from "./response.js";

export const errorHandler = (err, req, res, next) => {
    if (res.headersSent) return next(err);

    if (err && err.code === "23505") {
        const conflict = errors.conflict("Conflict");
        return sendError(res, req, conflict);
    }

    const apiError = err instanceof ApiError
        ? err
        : errors.internal("Internal server error", process.env.NODE_ENV === "production" ? null : err?.message);

    if (process.env.NODE_ENV !== "test") {
        console.error(`[${req.id}]`, err);
    }
    return sendError(res, req, apiError);
};
