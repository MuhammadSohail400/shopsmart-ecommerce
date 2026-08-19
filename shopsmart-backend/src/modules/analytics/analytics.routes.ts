import { Router } from 'express';
import { analyticsController } from './analytics.controller';
import { authMiddleware } from '@shared/middleware/auth.middleware';
import { requireRole } from '@shared/middleware/rbac.middleware';
import { validate } from '@shared/middleware/validate.middleware';
import { asyncHandler } from '@shared/middleware/error-handler.middleware';
import { dateRangeQuerySchema, topProductsQuerySchema, paginationQuerySchema } from './analytics.validators';
import { ROLES } from '@shared/constants/roles';

const router = Router();
router.use(authMiddleware, requireRole(ROLES.ADMIN));

router.get('/overview', asyncHandler(analyticsController.overview));
router.get('/sales', validate(dateRangeQuerySchema, 'query'), asyncHandler(analyticsController.sales));
router.get('/top-products', validate(topProductsQuerySchema, 'query'), asyncHandler(analyticsController.topProducts));
router.get('/customers', validate(dateRangeQuerySchema, 'query'), asyncHandler(analyticsController.customers));
router.get(
  '/abandoned-carts',
  validate(paginationQuerySchema, 'query'),
  asyncHandler(analyticsController.abandonedCarts),
);
router.get('/export', validate(dateRangeQuerySchema, 'query'), asyncHandler(analyticsController.exportCsv));

export { router as analyticsRoutes };
