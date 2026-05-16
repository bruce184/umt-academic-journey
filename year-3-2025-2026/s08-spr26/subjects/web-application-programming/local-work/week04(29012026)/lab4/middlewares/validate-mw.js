import { z } from 'zod';
import { AppError } from '../utils/app-error.js';

export const validate = (schema, source = 'body') => (req, res, next) => {
  try {
    const data = req[source];
    const parsedData = schema.parse(data);
    
    // Replace request data with parsed/coerced data
    req[source] = parsedData;
    
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Format Zod errors
      const details = error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));
      next(new AppError('Validation failed', 400, details));
    } else {
      next(error);
    }
  }
};
