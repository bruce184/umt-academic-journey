import AppError from "../utils/app-error.js";
import { errorResponse } from "../utils/response.js";

export function notFound(req, res) {
  const err = new AppError({
    statusCode: 404,
    code: "NOT_FOUND",
    message: "Route not found"
  });
  return errorResponse(res, err, 404, { requestId: req.requestId });
}

export function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;

  const normalized =
    err instanceof AppError
      ? err
      : new AppError({
          statusCode,
          code: "INTERNAL_ERROR",
          message: err.message || "Internal Server Error"
        });

  return errorResponse(res, normalized, statusCode, { requestId: req.requestId });
}
