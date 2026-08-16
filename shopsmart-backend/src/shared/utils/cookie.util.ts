import { Response } from 'express';
import { env } from '@config/env';

const REFRESH_COOKIE_NAME = 'refreshToken';

/**
 * Sets the refresh token as HttpOnly/Secure/SameSite=Strict, scoped to the
 * refresh endpoint path only (SDD Section 9.3). Only the auth module's
 * controller ever touches cookies (Backend Standards Section 10.3).
 */
export function setRefreshTokenCookie(res: Response, token: string, expiresAt: Date): void {
  const isProduction = env.NODE_ENV === 'production';
  const isCrossDomain = isProduction && (!env.COOKIE_DOMAIN || env.COOKIE_DOMAIN === 'localhost');

  res.cookie(REFRESH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isCrossDomain ? 'none' : 'strict',
    ...(env.COOKIE_DOMAIN && env.COOKIE_DOMAIN !== 'localhost' ? { domain: env.COOKIE_DOMAIN } : {}),
    path: '/api/v1/auth',
    expires: expiresAt,
  });
}

export function clearRefreshTokenCookie(res: Response): void {
  const isProduction = env.NODE_ENV === 'production';
  const isCrossDomain = isProduction && (!env.COOKIE_DOMAIN || env.COOKIE_DOMAIN === 'localhost');

  res.clearCookie(REFRESH_COOKIE_NAME, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isCrossDomain ? 'none' : 'strict',
    ...(env.COOKIE_DOMAIN && env.COOKIE_DOMAIN !== 'localhost' ? { domain: env.COOKIE_DOMAIN } : {}),
    path: '/api/v1/auth',
  });
}

export function getRefreshTokenFromCookie(cookies: Record<string, string>): string | undefined {
  return cookies[REFRESH_COOKIE_NAME];
}
