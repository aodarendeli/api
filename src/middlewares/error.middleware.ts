import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../core/errors/AppError';
import { ApiResponse } from '../core/response/ApiResponse';
import { logger } from '../utils/logger';

export function errorMiddleware(
  error: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  const requestId = req.id;
  const context = { requestId, path: req.path, method: req.method };

  if (error instanceof AppError) {
    if (!error.isOperational) {
      logger.error({ ...context, error: error.message, stack: error.stack }, 'Non-operational error');
    } else {
      logger.warn({ ...context, statusCode: error.statusCode, error: error.message }, 'Operational error');
    }
    ApiResponse.error(res, error.message, error.statusCode, error.errors);
    return;
  }

  if (error instanceof ZodError) {
    const errors = error.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    ApiResponse.error(res, 'Validation failed', 422, errors);
    return;
  }

  logger.error(
    { ...context, error: error.message, stack: error.stack },
    'Unhandled error',
  );

  ApiResponse.error(res, 'Internal Server Error', 500);
}
