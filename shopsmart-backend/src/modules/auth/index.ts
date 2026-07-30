/**
 * Auth Module — public interface.
 * Other modules must only import from this file, never auth's internals
 * (Backend Standards Section 4/6).
 *
 * Responsibility: registration, login, token lifecycle, session management.
 * Dependencies: none (foundational module).
 */
export { authRoutes } from './auth.routes';
export { authRepository } from './auth.repository';
export type { AuthenticatedUser } from './auth.types';

// Public functions other modules are allowed to call:
export { verifyAccessToken } from '@shared/utils/jwt.util';

export async function getCurrentUser(userId: string) {
  const { authRepository } = await import('./auth.repository');
  return authRepository.findById(userId);
}
