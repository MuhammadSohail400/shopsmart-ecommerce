import { Router } from 'express';
import { reviewsController } from './reviews.controller';
import { authMiddleware } from '@shared/middleware/auth.middleware';
import { requireRole } from '@shared/middleware/rbac.middleware';
import { validate } from '@shared/middleware/validate.middleware';
import { asyncHandler } from '@shared/middleware/error-handler.middleware';
import { createReviewSchema, listReviewsQuerySchema } from './reviews.validators';
import { ROLES } from '@shared/constants/roles';

const router = Router();

router.get(
  '/products/:productId/reviews',
  validate(listReviewsQuerySchema, 'query'),
  asyncHandler(reviewsController.listForProduct),
);
router.post(
  '/products/:productId/reviews',
  authMiddleware,
  validate(createReviewSchema),
  asyncHandler(reviewsController.create),
);
router.delete(
  '/reviews/:reviewId',
  authMiddleware,
  requireRole(ROLES.ADMIN),
  asyncHandler(reviewsController.moderate),
);

// Admin Moderation Suite
router.get(
  '/admin/reviews',
  authMiddleware,
  requireRole(ROLES.ADMIN),
  asyncHandler(reviewsController.adminList),
);
router.get(
  '/admin/reviews/stats',
  authMiddleware,
  requireRole(ROLES.ADMIN),
  asyncHandler(reviewsController.adminGetStats),
);
router.patch(
  '/admin/reviews/:reviewId/status',
  authMiddleware,
  requireRole(ROLES.ADMIN),
  asyncHandler(reviewsController.adminUpdateStatus),
);
router.delete(
  '/admin/reviews/:reviewId',
  authMiddleware,
  requireRole(ROLES.ADMIN),
  asyncHandler(reviewsController.adminDelete),
);

export { router as reviewsRoutes };

