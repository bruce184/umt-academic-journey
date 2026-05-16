export const buildMeta = (req, meta = {}) => ({
    requestId: req.id,
    timestamp: new Date().toISOString(),
    ...meta,
});

export const sendSuccess = (res, req, data, { status = 200, meta = {} } = {}) =>
    res.status(status).json({
        ok: true,
        data,
        meta: buildMeta(req, meta),
    });

export const sendError = (res, req, apiError) =>
    res.status(apiError.httpStatus || 500).json({
        ok: false,
        error: {
            code: apiError.code || "INTERNAL_ERROR",
            message: apiError.message || "Internal server error",
            details: apiError.details ?? null,
        },
        meta: buildMeta(req),
    });

export const responseMiddleware = (req, res, next) => {
    res.ok = (data, options = {}) => sendSuccess(res, req, data, options);
    next();
};
