import { ApiError } from "../utils/apiError.js";

export function notFound(_req, _res, next) {
  next(
    new ApiError({
      status: 404,
      code: "NOT_FOUND",
      message: "Route not found",
      details: null
    })
  );
}
