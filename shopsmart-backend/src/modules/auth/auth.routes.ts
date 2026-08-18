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
  verifyEmailSchema,
  verifyPhoneSchema,
} from './auth.validators';

const router = Router();

// Rate limits on auth endpoints (generous in development for manual testing)
const isDev = process.env.NODE_ENV !== 'production';
const loginLimit = rateLimit({ windowSeconds: 60, max: isDev ? 100 : 10, keyPrefix: 'auth-login' });
const registerLimit = rateLimit({ windowSeconds: 60, max: isDev ? 100 : 10, keyPrefix: 'auth-register' });
const resetLimit = rateLimit({ windowSeconds: 300, max: isDev ? 50 : 5, keyPrefix: 'auth-reset' });
const verifyLimit = rateLimit({ windowSeconds: 60, max: isDev ? 50 : 10, keyPrefix: 'auth-verify' });

router.post('/register', registerLimit, validate(registerSchema), asyncHandler(authController.register));
router.post('/verify-email', verifyLimit, validate(verifyEmailSchema), asyncHandler(authController.verifyEmail));
router.post('/verify-phone', verifyLimit, validate(verifyPhoneSchema), asyncHandler(authController.verifyPhone));
router.post('/login', loginLimit, validate(loginSchema), asyncHandler(authController.login));
router.post('/refresh', asyncHandler(authController.refresh));
router.post('/logout', authMiddleware, asyncHandler(authController.logout));

router.post(
  '/password-reset/request',
  resetLimit,
  validate(passwordResetRequestSchema),
  asyncHandler(authController.requestPasswordReset),
);
router.post(
  '/password-reset/confirm',
  resetLimit,
  validate(passwordResetConfirmSchema),
  asyncHandler(authController.confirmPasswordReset),
);

router.get('/sessions', authMiddleware, asyncHandler(authController.listSessions));
router.delete('/sessions/:sessionId', authMiddleware, asyncHandler(authController.revokeSession));

export { router as authRoutes };
