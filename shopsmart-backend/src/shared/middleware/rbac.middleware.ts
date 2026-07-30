import { Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import { AuthenticationError, AuthorizationError } from '@shared/errors';

/**
 * Role check only — resource-ownership checks (e.g. "is this the caller's
 * own order") belong in the service layer, not here (Backend Standards
 * Section 10.5). Must run after authMiddleware.
 */
export function requireRole(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new AuthenticationError());
      return;
    }
    if (!roles.includes(req.user.role)) {
      next(new AuthorizationError());
      return;
    }
    next();
  };
}
