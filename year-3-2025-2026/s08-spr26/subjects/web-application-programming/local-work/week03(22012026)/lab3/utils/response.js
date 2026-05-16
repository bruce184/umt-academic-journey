export const successResponse = (res, data, statusCode = 200, meta = {}) => {
  res.status(statusCode).json({
    data,
    meta: {
      timestamp: new Date().toISOString(),
      ...meta,
    },
    error: null,
  });
};

export const errorResponse = (res, error, statusCode = 500) => {
  res.status(statusCode).json({
    data: null,
    meta: {
      timestamp: new Date().toISOString(),
    },
    error: {
      code: statusCode,
      message: error.message || 'Internal Server Error',
      details: error.details || null,
    },
  });
};
