import { Router } from 'express';
import { wishlistController } from './wishlist.controller';
import { authMiddleware } from '@shared/middleware/auth.middleware';
import { validate } from '@shared/middleware/validate.middleware';
import { asyncHandler } from '@shared/middleware/error-handler.middleware';
import { addWishlistItemSchema, moveToCartSchema } from './wishlist.validators';

const router = Router();
router.use(authMiddleware); // FR-039: registered users only

router.get('/', asyncHandler(wishlistController.getWishlist));
router.post('/items', validate(addWishlistItemSchema), asyncHandler(wishlistController.addItem));
router.delete('/items/:productId', asyncHandler(wishlistController.removeItem));
router.post(
  '/items/:productId/move-to-cart',
  validate(moveToCartSchema),
  asyncHandler(wishlistController.moveToCart),
);

export { router as wishlistRoutes };
