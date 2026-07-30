import pino from 'pino';
import { env } from './env';

/**
 * Structured JSON logging (Backend Standards Section 12.1).
 * Every log call should include `module` and, where relevant, `requestId`
 * and `userId` via child loggers created per-request (see correlation-id
 * middleware) or per-module.
 */
export const logger = pino({
  level: env.LOG_LEVEL,
  transport:
    env.NODE_ENV === 'development'
      ? { target: 'pino-pretty', options: { colorize: true } }
      : undefined,
  base: { service: 'shopsmart-backend' },
});
