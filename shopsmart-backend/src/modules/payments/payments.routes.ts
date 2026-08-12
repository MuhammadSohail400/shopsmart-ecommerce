import { Router } from 'express';
import { paymentsController } from './payments.controller';
import { authMiddleware } from '@shared/middleware/auth.middleware';
import { requireRole } from '@shared/middleware/rbac.middleware';
import { validate } from '@shared/middleware/validate.middleware';
import { asyncHandler } from '@shared/middleware/error-handler.middleware';
import { rateLimit } from '@shared/middleware/rate-limit.middleware';
import { issueRefundSchema } from './payments.validators';
import { ROLES } from '@shared/constants/roles';

const router = Router();
router.use(authMiddleware);
const refundLimit = rateLimit({ windowSeconds: 60, max: 5, keyPrefix: 'refunds' });

router.get('/:orderId/payments', asyncHandler(paymentsController.listByOrder));
router.post(
  '/:orderId/refunds',
  refundLimit,
  requireRole(ROLES.ADMIN, ROLES.SUPPORT_AGENT),
  validate(issueRefundSchema),
  asyncHandler(paymentsController.issueRefund),
);

export { router as paymentsRoutes };

// Exported separately: the webhook route must NOT go through express.json()
// (Stripe signature verification needs the exact raw payload) or through
// authMiddleware (Stripe, not a user, calls this). Mounted directly in
// app.ts with express.raw(), per API Design Specification Section 17.
export { paymentsController as paymentsWebhookController };
