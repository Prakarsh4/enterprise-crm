const ApiResponse = require('../utils/apiResponse');

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  console.error(`[Error] ${req.method} ${req.originalUrl}:`, err);

  // Mongoose Bad ObjectId (CastError)
  if (err.name === 'CastError') {
    const message = `Resource not found with id of ${err.value}`;
    return ApiResponse.error(res, message, 404);
  }

  // Mongoose Duplicate Key Error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `Duplicate value entered for ${field} field. Value must be unique.`;
    return ApiResponse.error(res, message, 400);
  }

  // Mongoose Validation Error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map((val) => val.message).join(', ');
    return ApiResponse.error(res, message, 400);
  }

  // JSON Web Token Errors
  if (err.name === 'JsonWebTokenError') {
    return ApiResponse.error(res, 'Invalid authorization token', 401);
  }

  if (err.name === 'TokenExpiredError') {
    return ApiResponse.error(res, 'Authorization token expired', 401);
  }

  return ApiResponse.error(res, error.message || 'Internal Server Error', error.statusCode || 500);
};

module.exports = errorHandler;