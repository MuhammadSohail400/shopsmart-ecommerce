import { Router } from 'express';
import { ordersController } from './orders.controller';
import { authMiddleware } from '@shared/middleware/auth.middleware';
import { requireRole } from '@shared/middleware/rbac.middleware';
import { validate } from '@shared/middleware/validate.middleware';
import { asyncHandler } from '@shared/middleware/error-handler.middleware';
import { updateOrderStatusSchema, listOrdersQuerySchema, cancelOrderSchema } from './orders.validators';
import { ROLES } from '@shared/constants/roles';

const router = Router();
router.use(authMiddleware); // every order endpoint requires auth (owner or staff)

router.get('/', validate(listOrdersQuerySchema, 'query'), asyncHandler(ordersController.list));
router.get('/:orderId', asyncHandler(ordersController.getById));
router.post('/:orderId/cancellation', validate(cancelOrderSchema), asyncHandler(ordersController.cancel));
router.post('/:orderId/delivery-confirmation', asyncHandler(ordersController.confirmDelivery));

router.patch(
  '/:orderId/status',
  requireRole(ROLES.ADMIN),
  validate(updateOrderStatusSchema),
  asyncHandler(ordersController.updateStatus),
);

export { router as ordersRoutes };
