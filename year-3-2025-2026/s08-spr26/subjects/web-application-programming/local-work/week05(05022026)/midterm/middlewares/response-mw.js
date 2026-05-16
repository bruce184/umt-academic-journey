import { successResponse, errorResponse } from "../utils/response.js";
import AppError from "../utils/app-error.js";

export default function responseFormatter() {
  return (req, res, next) => {
    res.ok = (data, meta = {}) => {
      return successResponse(res, data, 200, meta);
    };

    res.created = (data, meta = {}) => {
      return successResponse(res, data, 201, meta);
    };

    res.noContent = (meta = {}) => {
      return successResponse(res, null, 204, meta);
    };
    res.list = (items, meta = {}) => {
      return successResponse(res, items, 200, meta);
    };
    res.error = (err, statusCode = 500) => {
      if (!(err instanceof AppError)) {
        err = new AppError({ message: err.message || "Internal Server Error", statusCode, details: err.details || null });
      }
      return next(err);
    };

    next();
  };
}
