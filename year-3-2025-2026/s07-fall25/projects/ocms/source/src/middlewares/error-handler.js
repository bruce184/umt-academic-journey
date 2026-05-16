// Global error-handling middleware
import { sendError } from "../controllers/response-util.js";

export default function globalErrorHandler(err, req, res, next) {
  // If headers already sent, delegate to default handler
  if (res.headersSent) {
    return next(err);
  }

  // Log minimal error info (stack may be large)
  console.error("[globalErrorHandler]", err && err.message, err && err.stack);

  // If error already has status and message, use them
  const status = (err && err.status) || 500;
  const code = (err && err.code) || "UNHANDLED_ERROR";
  const message = (err && err.message) || "Internal server error";

  return sendError(res, status, code, message);
}
