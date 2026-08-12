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

export { router as reviewsRoutes };
