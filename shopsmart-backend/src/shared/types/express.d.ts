import { Role } from '@prisma/client';

/**
 * Augments Express's Request with the fields our middleware attaches,
 * so every controller gets typed access to `req.user` without casting.
 */
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: Role;
      };
    }
  }
}

export {};
