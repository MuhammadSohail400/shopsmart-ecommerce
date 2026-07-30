import Redis from 'ioredis';
import { env } from './env';
import { logger } from './logger';

/**
 * Single Redis client for caching, rate limiting, and refresh-token
 * bookkeeping (SDD Section 11). All access goes through this instance;
 * modules should wrap usage in a namespaced cache helper rather than
 * calling this client with ad-hoc keys (Backend Standards Section 15.1).
 */
export const redis = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: 3,
});

redis.on('error', (err) => {
  logger.error({ err }, 'Redis connection error');
});

redis.on('connect', () => {
  logger.info('Redis connected');
});
