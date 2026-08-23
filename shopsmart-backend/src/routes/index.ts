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
import { shippingRoutes } from '@modules/shipping';
import { ordersRoutes } from '@modules/orders';
import { paymentsRoutes } from '@modules/payments';
import { checkoutRoutes } from '@modules/checkout';
import { reviewsRoutes } from '@modules/reviews';
import { notificationsRoutes } from '@modules/notifications';
import { settingsRoutes } from '@modules/settings';
import { auditLogsRoutes } from '@modules/audit-logs';
import { adminRoutes } from '@modules/admin';
import { analyticsRoutes } from '@modules/analytics';
import { cmsRoutes } from '@modules/cms';
import { newsletterRoutes } from '@modules/marketing';
import { contactRoutes } from '@modules/contact';
import { uploadsRouter } from '@modules/uploads';

/**
 * Single place every module's router is mounted under the versioned
 * /api/v1 prefix (Backend Standards Section 3). The Stripe webhook route
 * is NOT here — it's mounted directly in app.ts with a raw-body parser,
 * before the global express.json() middleware (see app.ts comments).
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
router.use('/shipping', shippingRoutes);
router.use('/orders', ordersRoutes);
router.use('/orders', paymentsRoutes); // exposes /orders/:orderId/payments, /orders/:orderId/refunds
router.use('/checkout', checkoutRoutes);
router.use('/', reviewsRoutes); // exposes /products/:productId/reviews, /reviews/:reviewId
router.use('/', notificationsRoutes); // exposes /users/me/notification-preferences, /admin/notification-logs
router.use('/admin/settings', settingsRoutes);
router.use('/admin/audit-logs', auditLogsRoutes);
router.use('/admin/analytics', analyticsRoutes);
router.use('/admin', adminRoutes); // exposes /admin/dashboard/summary, /admin/orders, /admin/staff — mounted last since it's the broadest /admin/* prefix
router.use('/cms', cmsRoutes);
router.use('/newsletter', newsletterRoutes); // exposes /newsletter/subscribe
router.use('/contact', contactRoutes); // exposes /contact
router.use('/uploads', uploadsRouter); // exposes /uploads/custom-design

export { router as apiRouter };
