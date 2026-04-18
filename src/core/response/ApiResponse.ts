import { Response } from 'express';

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponseBody<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  meta?: PaginationMeta | Record<string, unknown>;
  errors?: Array<{ field?: string; message: string }>;
}

export class ApiResponse {
  static success<T>(
    res: Response,
    data: T,
    message: string = 'Success',
    statusCode: number = 200,
    meta?: PaginationMeta | Record<string, unknown>,
  ): Response {
    const body: ApiResponseBody<T> = { success: true, message, data };
    if (meta) body.meta = meta;
    return res.status(statusCode).json(body);
  }

  static created<T>(res: Response, data: T, message: string = 'Created successfully'): Response {
    return ApiResponse.success(res, data, message, 201);
  }

  static error(
    res: Response,
    message: string,
    statusCode: number = 500,
    errors?: Array<{ field?: string; message: string }>,
  ): Response {
    const body: ApiResponseBody = { success: false, message };
    if (errors && errors.length > 0) body.errors = errors;
    return res.status(statusCode).json(body);
  }

  static noContent(res: Response): Response {
    return res.status(204).send();
  }
}
