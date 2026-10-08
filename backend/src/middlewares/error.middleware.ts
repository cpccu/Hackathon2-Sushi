import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors.js';
import { env } from '../config/env.js';

export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      details: err.details,
    });
    return;
  }

  // PostgreSQL unique constraint violation error code 23505
  if (err && err.code === '23505') {
    res.status(409).json({
      success: false,
      message: 'A duplicate entry already exists in the system',
      detail: err.detail,
    });
    return;
  }

  console.error('Unhandled Application Error:', err);

  res.status(500).json({
    success: false,
    message: env.NODE_ENV === 'production' ? 'Internal server error' : err.message || 'Internal server error',
  });
};
