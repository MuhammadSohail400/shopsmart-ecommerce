import { Router } from 'express';
import { couponsController } from './coupons.controller';
import { authMiddleware, optionalAuthMiddleware } from '@shared/middleware/auth.middleware';
import { requireRole } from '@shared/middleware/rbac.middleware';
import { validate } from '@shared/middleware/validate.middleware';
import { asyncHandler } from '@shared/middleware/error-handler.middleware';
import { createCouponSchema, updateCouponSchema, validateCouponSchema } from './coupons.validators';
import { ROLES } from '@shared/constants/roles';

const router = Router();

router.get(
  '/',
  authMiddleware,
  requireRole(ROLES.ADMIN, ROLES.SUPPORT_AGENT),
  asyncHandler(couponsController.list),
);

router.post(
  '/',
  authMiddleware,
  requireRole(ROLES.ADMIN),
  validate(createCouponSchema),
  asyncHandler(couponsController.create),
);
router.patch(
  '/:couponId',
  authMiddleware,
  requireRole(ROLES.ADMIN),
  validate(updateCouponSchema),
  asyncHandler(couponsController.update),
);
router.delete(
  '/:couponId',
  authMiddleware,
  requireRole(ROLES.ADMIN),
  asyncHandler(couponsController.deactivate),
);

// Optional auth: usage-limit check only applies when a user is known
router.post(
  '/validate',
  optionalAuthMiddleware,
  validate(validateCouponSchema),
  asyncHandler(couponsController.validate),
);

export { router as couponsRoutes };
