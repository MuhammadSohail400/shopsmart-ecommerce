/**
 * Base error class every thrown error in the codebase extends.
 * `isOperational = true` means "expected" (bad input, business rule
 * violation) vs `false` meaning an unexpected bug/infra failure
 * (Backend Standards Section 8.1 / 8.4).
 */
export abstract class AppError extends Error {
  abstract readonly statusCode: number;
  abstract readonly code: string;
  readonly isOperational: boolean = true;
  readonly validationErrors?: Array<{ field: string; message: string }>;

  constructor(message: string, validationErrors?: Array<{ field: string; message: string }>) {
    super(message);
    this.name = this.constructor.name;
    this.validationErrors = validationErrors;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  readonly statusCode = 422;
  readonly code = 'VALIDATION_ERROR';
}

export class BusinessRuleError extends AppError {
  readonly statusCode = 422;
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}

export class AuthenticationError extends AppError {
  readonly statusCode = 401;
  readonly code: string;

  constructor(code: string = 'AUTHENTICATION_FAILED', message = 'Invalid credentials') {
    super(message);
    this.code = code;
  }
}

export class AuthorizationError extends AppError {
  readonly statusCode = 403;
  readonly code = 'FORBIDDEN';

  constructor(message = "You don't have permission to perform this action") {
    super(message);
  }
}

export class NotFoundError extends AppError {
  readonly statusCode = 404;
  readonly code = 'NOT_FOUND';

  constructor(resource: string) {
    super(`${resource} not found`);
  }
}

export class ConflictError extends AppError {
  readonly statusCode = 409;
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}

export class PreconditionFailedError extends AppError {
  readonly statusCode = 412;
  readonly code = 'PRECONDITION_FAILED';
}

export class RateLimitError extends AppError {
  readonly statusCode = 429;
  readonly code = 'RATE_LIMIT_EXCEEDED';

  constructor(message = 'Too many requests, please try again later') {
    super(message);
  }
}

export class ExternalServiceError extends AppError {
  readonly statusCode = 502;
  readonly code = 'EXTERNAL_SERVICE_ERROR';
  readonly isOperational = false;
}
