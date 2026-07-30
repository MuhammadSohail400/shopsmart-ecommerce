import { Router } from 'express';
import { authRoutes } from '@modules/auth';
import { usersRoutes } from '@modules/users';
import { categoriesRoutes } from '@modules/categories';
import { brandsRoutes } from '@modules/brands';
import { productsRoutes } from '@modules/products';
import { inventoryRoutes } from '@modules/inventory';
import { cartRoutes } from '@modules/cart';
import { wishlistRoutes } from '@modules/wishlist';
import { couponsRoutes } from '@modules/coupons';

/**
 * Single place every module's router is mounted under the versioned
 * /api/v1 prefix (Backend Standards Section 3). Additional modules
 * (checkout, orders, payments, ...) are added here in later phases.
 */
const router = Router();

router.use('/auth', authRoutes);
router.use('/users', usersRoutes);
router.use('/categories', categoriesRoutes);
router.use('/brands', brandsRoutes);
router.use('/products', productsRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/cart', cartRoutes);
router.use('/wishlist', wishlistRoutes);
router.use('/coupons', couponsRoutes);

export { router as apiRouter };
