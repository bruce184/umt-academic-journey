// Tự validate theo "chỉ tech trong slide": middleware validate body/query

import { ApiError } from "../utils/apiError.js";

export function validateBody(validatorFn) {
  return (req, _res, next) => {
    const { ok, errors, cleaned } = validatorFn(req.body);

    if (!ok) {
      return next(
        new ApiError({
          status: 400,
          code: "VALIDATION_ERROR",
          message: "Invalid request body",
          details: errors
        })
      );
    }

    // nếu muốn, ta có thể dùng cleaned để đảm bảo chỉ field hợp lệ
    req.validateBody = cleaned;
    next();
  };
}

export function validateQuery(validatorFn) {
  return (req, _res, next) => {
    const { ok, errors, cleaned } = validatorFn(req.query);

    if (!ok) {
      return next(
        new ApiError({
          status: 400,
          code: "VALIDATION_ERROR",
          message: "Invalid query params",
          details: errors
        })
      );
    }

    req.validateQuery = cleaned;
    next();
  };
}
