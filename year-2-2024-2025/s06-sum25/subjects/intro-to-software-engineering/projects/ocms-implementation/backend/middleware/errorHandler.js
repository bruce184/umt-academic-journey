const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  console.error('Error:', err);

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = { message, statusCode: 404 };
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = 'Duplicate field value entered';
    error = { message, statusCode: 400 };
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message);
    error = { message, statusCode: 400 };
  }

  // SQL Server errors
  if (err.number) {
    switch (err.number) {
      case 2627: // Unique constraint violation
        error = { message: 'Duplicate entry', statusCode: 400 };
        break;
      case 547: // Foreign key constraint violation
        error = { message: 'Referenced record not found', statusCode: 400 };
        break;
      case 208: // Invalid object name
        error = { message: 'Table not found', statusCode: 500 };
        break;
      default:
        error = { message: err.message, statusCode: 500 };
    }
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler; 