import { AppError } from "../utils/app-error.js";

// Middleware xử lý route không tồn tại
export function notFoundMw(req, res, next) {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
}

// Middleware xử lý lỗi tổng
export function errorMw(err, req, res, next) {
  const statusCode = err instanceof AppError ? err.statusCode : 500;

  res.status(statusCode).json({
    message: err.message || "Internal Server Error",
    details: err.details || null,
  });
}