import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '@shared/utils/jwt.util';
import { AuthenticationError } from '@shared/errors';

/**
 * Verifies the Bearer access token and attaches req.user (SDD Section 9.1,
 * SDD Section 9.4). Runs before the RBAC guard on any protected route.
 */
export function authMiddleware(req: Request, _res: Response, next: NextFunction): void {
  const header = req.header('Authorization');

  if (!header || !header.startsWith('Bearer ')) {
    next(new AuthenticationError('MISSING_TOKEN', 'Authentication required'));
    return;
  }

  const token = header.slice('Bearer '.length);

  try {
    const payload = verifyAccessToken(token);
    req.user = { id: payload.sub, role: payload.role };
    next();
  } catch {
    next(new AuthenticationError('INVALID_TOKEN', 'Invalid or expired access token'));
  }
}

/**
 * Like authMiddleware, but does not fail if no token is present — used on
 * routes that behave differently for guests vs. registered users
 * (e.g., cart, checkout) without requiring authentication outright.
 */
export function optionalAuthMiddleware(req: Request, _res: Response, next: NextFunction): void {
  const header = req.header('Authorization');
  if (!header || !header.startsWith('Bearer ')) {
    next();
    return;
  }
  try {
    const payload = verifyAccessToken(header.slice('Bearer '.length));
    req.user = { id: payload.sub, role: payload.role };
  } catch {
    // Invalid token on an optional-auth route: proceed as guest rather than fail
  }
  next();
}
