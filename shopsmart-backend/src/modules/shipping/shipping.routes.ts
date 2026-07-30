import { Router } from 'express';
import { shippingController } from './shipping.controller';
import { authMiddleware } from '@shared/middleware/auth.middleware';
import { requireRole } from '@shared/middleware/rbac.middleware';
import { validate } from '@shared/middleware/validate.middleware';
import { asyncHandler } from '@shared/middleware/error-handler.middleware';
import { createZoneSchema, createRateSchema } from './shipping.validators';
import { ROLES } from '@shared/constants/roles';

const router = Router();
const adminOnly = [authMiddleware, requireRole(ROLES.ADMIN)];

router.get('/zones', ...adminOnly, asyncHandler(shippingController.listZones));
router.post('/zones', ...adminOnly, validate(createZoneSchema), asyncHandler(shippingController.createZone));
router.post('/rates', ...adminOnly, validate(createRateSchema), asyncHandler(shippingController.createRate));

// Order-scoped shipment lookup — auth handled at the orders route level in
// practice; kept open here at the module level for internal/staff use.
router.get(
  '/orders/:orderId/shipment',
  authMiddleware,
  asyncHandler(shippingController.getShipment),
);

export { router as shippingRoutes };
