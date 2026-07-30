import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '@shared/errors';
import { logger } from '@config/logger';

/**
 * Single global error handler (Backend Standards Section 8.2), mounted
 * last in app.ts. Maps every thrown error to the RFC 7807-aligned
 * envelope defined in API Design Specification Section 7.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandlerMiddleware(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  const requestId = res.locals.requestId as string | undefined;
  const timestamp = new Date().toISOString();

  // Zod errors that slip through without being wrapped (defensive fallback)
  if (err instanceof ZodError) {
    res.status(422).json({
      success: false,
      error: {
        type: 'https://shopsmart.ai/errors/validation-error',
        title: 'Validation Error',
        status: 422,
        code: 'VALIDATION_ERROR',
        detail: 'One or more fields failed validation.',
        userMessage: 'Please check the highlighted fields and try again.',
        instance: req.originalUrl,
        requestId,
        timestamp,
        validationErrors: err.issues.map((i) => ({
          field: i.path.join('.'),
          message: i.message,
        })),
      },
    });
    return;
  }

  if (err instanceof AppError) {
    const logPayload = { requestId, code: err.code, path: req.originalUrl };
    if (err.isOperational) {
      logger.warn(logPayload, err.message);
    } else {
      logger.error({ ...logPayload, stack: err.stack }, err.message);
    }

    res.status(err.statusCode).json({
      success: false,
      error: {
        type: `https://shopsmart.ai/errors/${err.code.toLowerCase().replace(/_/g, '-')}`,
        title: err.name,
        status: err.statusCode,
        code: err.code,
        detail: err.message,
        userMessage: err.message,
        instance: req.originalUrl,
        requestId,
        timestamp,
        validationErrors: err.validationErrors ?? [],
      },
    });
    return;
  }

  // Unknown/unexpected error — never leak internals to the client
  const error = err as Error;
  logger.error({ requestId, stack: error.stack, path: req.originalUrl }, error.message);

  res.status(500).json({
    success: false,
    error: {
      type: 'https://shopsmart.ai/errors/internal-server-error',
      title: 'Internal Server Error',
      status: 500,
      code: 'INTERNAL_SERVER_ERROR',
      detail: 'An unexpected error occurred.',
      userMessage: 'Something went wrong on our end. Please try again shortly.',
      instance: req.originalUrl,
      requestId,
      timestamp,
    },
  });
}

/** Wraps async route handlers so rejected promises reach the error handler. */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>,
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    fn(req, res, next).catch(next);
  };
}
