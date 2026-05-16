import { successResponse, errorResponse } from '../utils/response.js';
import { AppError } from '../utils/app-error.js';

export const responseMiddleware = (req, res, next) => {
  res.ok = (data, meta = {}) => successResponse(res, data, 200, meta);
  res.created = (data, meta = {}) => successResponse(res, data, 201, meta);
  res.noContent = () => res.status(204).send();
  res.list = (items, meta = {}) => successResponse(res, items, 200, meta);
  res.error = (error, statusCode = 500) => {
    next(new AppError(error.message, statusCode, error.details));
  };

  next();
};
