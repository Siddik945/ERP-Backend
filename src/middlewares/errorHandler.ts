import { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { env } from '../config/env';
import { ApiError } from '../utils/ApiError';

export const globalErrorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  let statusCode = 500;
  let message = 'Internal server error';
  let errors: unknown = undefined;

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
  } else if (err instanceof ZodError) {
    statusCode = 400;
    message = 'Validation failed';
    errors = err.flatten();
  } else if (err?.name === 'ValidationError') {
    statusCode = 400;
    message = 'Mongoose validation failed';
    errors = err.errors;
  } else if (err?.code === 11000) {
    statusCode = 409;
    const fields = Object.keys(err.keyPattern || {}).join(', ');
    message = `${fields || 'Duplicate field'} already exists`;
  } else if (err?.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid resource id';
  } else if (err?.message) {
    message = err.message;
  }

  res.status(statusCode).json({
    success: false,
    message,
    errors,
    stack: env.nodeEnv === 'development' ? err.stack : undefined
  });
};
