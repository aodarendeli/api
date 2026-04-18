import { AppError } from './AppError';

export class BadRequestError extends AppError {
  constructor(
    message: string = 'Bad Request',
    errors?: Array<{ field?: string; message: string }>,
  ) {
    super(message, 400, true, errors);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden') {
    super(message, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Resource already exists') {
    super(message, 409);
  }
}

export class UnprocessableEntityError extends AppError {
  constructor(
    message: string = 'Unprocessable Entity',
    errors?: Array<{ field?: string; message: string }>,
  ) {
    super(message, 422, true, errors);
  }
}

export class TooManyRequestsError extends AppError {
  constructor(message: string = 'Too many requests') {
    super(message, 429);
  }
}

export class InternalServerError extends AppError {
  constructor(message: string = 'Internal Server Error') {
    super(message, 500, false);
  }
}
