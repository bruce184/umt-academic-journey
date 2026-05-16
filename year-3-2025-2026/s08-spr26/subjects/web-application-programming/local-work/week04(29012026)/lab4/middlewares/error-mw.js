import { errorResponse } from '../utils/response.js';

export const errorMiddleware = (err, req, res, next) => {
  console.error('ERROR 💥:', err);

  const statusCode = err.statusCode || 500;
  const errorObj = {
    message: err.message || 'Internal Server Error',
    details: err.details || null,
  };

  errorResponse(res, errorObj, statusCode);
};
