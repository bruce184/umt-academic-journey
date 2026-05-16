export class ApiError extends Error {
    constructor(code, message, httpStatus = 500, details = null) {
        super(message);
        this.name = "ApiError";
        this.code = code;
        this.httpStatus = httpStatus;
        this.details = details;
    }
}

export const errors = {
    authMissingToken: (message = "Missing Bearer token") =>
        new ApiError("AUTH_MISSING_TOKEN", message, 401),
    authInvalidToken: (message = "Invalid token") =>
        new ApiError("AUTH_INVALID_TOKEN", message, 401),
    authExpiredToken: (message = "Token expired") =>
        new ApiError("AUTH_EXPIRED_TOKEN", message, 401),
    authUserNotFound: (message = "User not found") =>
        new ApiError("AUTH_USER_NOT_FOUND", message, 401),
    forbidden: (message = "Forbidden", details = null) =>
        new ApiError("FORBIDDEN", message, 403, details),
    notFound: (message = "Not found", details = null) =>
        new ApiError("NOT_FOUND", message, 404, details),
    validation: (message = "Validation error", details = null) =>
        new ApiError("VALIDATION_ERROR", message, 422, details),
    conflict: (message = "Conflict", details = null) =>
        new ApiError("CONFLICT", message, 409, details),
    internal: (message = "Internal server error", details = null) =>
        new ApiError("INTERNAL_ERROR", message, 500, details),
};
