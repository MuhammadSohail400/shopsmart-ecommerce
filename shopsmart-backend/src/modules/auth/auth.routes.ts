import { Router } from 'express';
import { authController } from './auth.controller';
import { validate } from '@shared/middleware/validate.middleware';
import { authMiddleware } from '@shared/middleware/auth.middleware';
import { rateLimit } from '@shared/middleware/rate-limit.middleware';
import { asyncHandler } from '@shared/middleware/error-handler.middleware';
import {
  registerSchema,
  loginSchema,
  passwordResetRequestSchema,
  passwordResetConfirmSchema,
} from './auth.validators';

const router = Router();

// Strict rate limits on auth endpoints per API Design Specification Section 16
const strictLimit = rateLimit({ windowSeconds: 900, max: 5, keyPrefix: 'auth-strict' });

router.post('/register', strictLimit, validate(registerSchema), asyncHandler(authController.register));
router.post('/login', strictLimit, validate(loginSchema), asyncHandler(authController.login));
router.post('/refresh', asyncHandler(authController.refresh));
router.post('/logout', authMiddleware, asyncHandler(authController.logout));

router.post(
  '/password-reset/request',
  strictLimit,
  validate(passwordResetRequestSchema),
  asyncHandler(authController.requestPasswordReset),
);
router.post(
  '/password-reset/confirm',
  strictLimit,
  validate(passwordResetConfirmSchema),
  asyncHandler(authController.confirmPasswordReset),
);

router.get('/sessions', authMiddleware, asyncHandler(authController.listSessions));
router.delete('/sessions/:sessionId', authMiddleware, asyncHandler(authController.revokeSession));

export { router as authRoutes };
