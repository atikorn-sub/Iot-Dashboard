import type { NextFunction, Request, RequestHandler, Response } from 'express';
import type { ApiErrorResponse } from '../types/api';

export class HttpError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly details?: string[],
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

/** Forwards rejected promises from async controllers to the error middleware (Express 4) */
export const asyncHandler =
  (handler: (req: Request, res: Response) => Promise<void>): RequestHandler =>
  (req, res, next) => {
    handler(req, res).catch(next);
  };

export const notFoundHandler = (req: Request, res: Response<ApiErrorResponse>): void => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
};

export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response<ApiErrorResponse>,
  // Express identifies error middleware by its 4-argument signature
  _next: NextFunction,
): void => {
  if (err instanceof HttpError) {
    res.status(err.statusCode).json({ error: err.message, details: err.details });
    return;
  }

  if (err instanceof SyntaxError && 'body' in err) {
    res.status(400).json({ error: 'Malformed JSON payload' });
    return;
  }

  console.error('[error]', err);
  res.status(500).json({ error: 'Internal server error' });
};
