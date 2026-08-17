import { Router } from 'express';
import { cartController } from './cart.controller';
import { optionalAuthMiddleware } from '@shared/middleware/auth.middleware';
import { validate } from '@shared/middleware/validate.middleware';
import { asyncHandler } from '@shared/middleware/error-handler.middleware';
import { addCartItemSchema, updateCartItemSchema, applyCouponSchema } from './cart.validators';

const router = Router();
router.use(optionalAuthMiddleware); // supports both guest (header) and registered (JWT)

router.get('/', asyncHandler(cartController.getCart));
router.delete('/', asyncHandler(cartController.clearCart));

router.post('/items', validate(addCartItemSchema), asyncHandler(cartController.addItem));
router.patch(
  '/items/:itemId',
  validate(updateCartItemSchema),
  asyncHandler(cartController.updateItem),
);
router.delete('/items/:itemId', asyncHandler(cartController.removeItem));

router.post('/coupon', validate(applyCouponSchema), asyncHandler(cartController.applyCoupon));
router.delete('/coupon', asyncHandler(cartController.removeCoupon));
router.post('/merge', asyncHandler(cartController.mergeCart));

export { router as cartRoutes };
