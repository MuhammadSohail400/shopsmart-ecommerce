import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { ValidationError } from '@shared/errors';

type RequestPart = 'body' | 'query' | 'params';

/**
 * Validation middleware factory (Backend Standards Section 9.3).
 * Parses req[part] through the given Zod schema BEFORE the controller
 * runs; on failure throws a ValidationError with the full field-level
 * issue list, matching API Design Specification Section 7.
 */
export function validate(schema: ZodSchema, part: RequestPart = 'body') {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[part]);

    if (!result.success) {
      const validationErrors = result.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));
      next(new ValidationError('Request validation failed', validationErrors));
      return;
    }

    // Replace with the parsed (and coerced/defaulted) data
    (req as unknown as Record<string, unknown>)[part] = result.data;
    next();
  };
}
