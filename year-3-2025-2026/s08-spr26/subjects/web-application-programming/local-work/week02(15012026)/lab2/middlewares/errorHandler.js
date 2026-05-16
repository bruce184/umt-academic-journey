// middlewares/errorHandler.js
// Centralized error handler: không leak stack

import { ApiError } from "../utils/apiError.js";

export function errorHandler(err, req, res, _next) {
  // 1) ApiError (chuẩn hoá theo bạn)
  if (err instanceof ApiError) {
    return res.status(err.status).json({
      error: {
        code: err.code,
        message: err.message,
        details: err.details,
        traceId: req.traceId,
      },
    });
  }

  // 2) Lỗi dạng plain object (đi từ res.error(...) / custom throws)
  //    Expected fields: statusCode, message, code, details
  const statusCode = err?.statusCode ?? err?.status ?? 500;
  const code = err?.code ?? (statusCode === 404 ? "NOT_FOUND" : "INTERNAL_ERROR");
  const message =
    err?.message ??
    (statusCode === 404
      ? `Can't find ${req.originalUrl} on this server!`
      : "Server error");
  const details = err?.details ?? null;

  // Log lỗi không lường trước (>=500)
  if (statusCode >= 500) {
    console.error("UNHANDLED_ERROR:", err);
  }

  return res.status(statusCode).json({
    error: {
      code,
      message,
      details,
      traceId: req.traceId,
    },
  });
}
