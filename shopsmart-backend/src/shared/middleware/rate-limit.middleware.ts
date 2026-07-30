import { Request, Response, NextFunction } from 'express';
import { redis } from '@config/redis';
import { RateLimitError } from '@shared/errors';

interface RateLimitOptions {
  windowSeconds: number;
  max: number;
  keyPrefix: string;
}

/**
 * Redis-backed sliding-window-ish (fixed-window, simpler and sufficient
 * at this scale) rate limiter (API Design Specification Section 16).
 * Keyed by IP by default; pass a custom keyFn for per-user limits.
 */
export function rateLimit(options: RateLimitOptions, keyFn?: (req: Request) => string) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const identifier = keyFn ? keyFn(req) : req.ip;
    const key = `ratelimit:${options.keyPrefix}:${identifier}`;

    try {
      const count = await redis.incr(key);
      if (count === 1) {
        await redis.expire(key, options.windowSeconds);
      }

      if (count > options.max) {
        const ttl = await redis.ttl(key);
        res.setHeader('Retry-After', ttl > 0 ? ttl : options.windowSeconds);
        next(new RateLimitError());
        return;
      }

      next();
    } catch {
      // If Redis is temporarily unavailable, degrade gracefully rather than
      // hard-failing every request (SDD Section 18: graceful degradation)
      next();
    }
  };
}
