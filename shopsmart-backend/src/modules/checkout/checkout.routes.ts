import { Router } from 'express';
import { checkoutController } from './checkout.controller';
import { optionalAuthMiddleware } from '@shared/middleware/auth.middleware';
import { validate } from '@shared/middleware/validate.middleware';
import { asyncHandler } from '@shared/middleware/error-handler.middleware';
import { rateLimit } from '@shared/middleware/rate-limit.middleware';
import { createSessionSchema, confirmSessionSchema } from './checkout.validators';

const router = Router();
router.use(optionalAuthMiddleware);

// API Design Spec Section 16: checkout rate-limited per user/IP
const checkoutLimit = rateLimit({ windowSeconds: 60, max: 10, keyPrefix: 'checkout' });

router.post('/sessions', checkoutLimit, validate(createSessionSchema), asyncHandler(checkoutController.createSession));
router.get('/sessions/:sessionId', asyncHandler(checkoutController.getSession));
router.post(
  '/sessions/:sessionId/confirm',
  checkoutLimit,
  validate(confirmSessionSchema),
  asyncHandler(checkoutController.confirm),
);

export { router as checkoutRoutes };
