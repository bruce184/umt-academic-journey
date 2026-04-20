export const successResponse = (res, data, statusCode = 200, meta = {}) => {
  // 204: không được trả body
  if (statusCode === 204) return res.status(204).end();
  return res.status(statusCode).json({
    data,
    meta: { timestamp: new Date().toISOString(), ...meta },
    error: null
  });
};


export const errorResponse = (res, err, statusCode = 500, meta = {}) => {
  return res.status(statusCode).json({
    data: null,
    meta: { timestamp: new Date().toISOString(), ...meta },
    error: {
      code: err.code || "INTERNAL_ERROR",
      message: err.message || "Internal Server Error",
      details: err.details || null
    }
  });
};
