import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';
import { env } from '@config/env';
import { Role } from '@prisma/client';

export interface AccessTokenPayload {
  sub: string; // userId
  role: Role;
}

/**
 * Access token: short-lived, minimal claims, no PII (SDD Section 9.1 / SEC-013).
 */
export function signAccessToken(payload: AccessTokenPayload): string {
  const options: jwt.SignOptions = {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  };
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, options);
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessTokenPayload;
}

/**
 * Refresh tokens are opaque random values, never JWTs — only a hash of the
 * raw value is persisted (DDD Section 17: "Token Storage"). The raw value
 * is only ever held by the client, in the HttpOnly cookie.
 */
export function generateRefreshToken(): { raw: string; hash: string } {
  const raw = crypto.randomBytes(64).toString('hex');
  const hash = crypto.createHash('sha256').update(raw).digest('hex');
  return { raw, hash };
}

export function hashRefreshToken(raw: string): string {
  return crypto.createHash('sha256').update(raw).digest('hex');
}

/**
 * Dedicated cryptographically secure random password reset token.
 * Raw token is 64 hex characters (32 random bytes), never a JWT.
 * Only the SHA-256 hash is stored in Redis.
 */
export function generatePasswordResetToken(): { raw: string; hash: string } {
  const raw = crypto.randomBytes(32).toString('hex');
  const hash = crypto.createHash('sha256').update(raw).digest('hex');
  return { raw, hash };
}

export function hashPasswordResetToken(raw: string): string {
  return crypto.createHash('sha256').update(raw).digest('hex');
}

