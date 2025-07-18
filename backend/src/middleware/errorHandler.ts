import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../../../shared/types';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let error: ApiError = {
    message: err.message || 'Internal Server Error',
    statusCode: err.statusCode || 500,
    code: err.code || 'INTERNAL_ERROR'
  };

  // Log error for debugging
  console.error('❌ Error:', {
    message: error.message,
    statusCode: error.statusCode,
    code: error.code,
    stack: err.stack,
    url: req.url,
    method: req.method,
    body: req.body,
    params: req.params,
    query: req.query
  });

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map((val: any) => val.message).join(', ');
    error = {
      message,
      statusCode: 400,
      code: 'VALIDATION_ERROR'
    };
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    error = {
      message: `${field} already exists`,
      statusCode: 400,
      code: 'DUPLICATE_ERROR'
    };
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = {
      message: 'Invalid token',
      statusCode: 401,
      code: 'INVALID_TOKEN'
    };
  }

  if (err.name === 'TokenExpiredError') {
    error = {
      message: 'Token expired',
      statusCode: 401,
      code: 'TOKEN_EXPIRED'
    };
  }

  // Firebase errors
  if (err.code && err.code.startsWith('auth/')) {
    error = {
      message: 'Authentication error',
      statusCode: 401,
      code: 'AUTH_ERROR'
    };
  }

  // Don't leak error details in production
  if (process.env.NODE_ENV === 'production' && error.statusCode === 500) {
    error.message = 'Something went wrong';
  }

  res.status(error.statusCode).json({
    success: false,
    error: error.message,
    code: error.code,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};
