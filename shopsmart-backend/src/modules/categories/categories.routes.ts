import { Router } from 'express';
import { categoriesController } from './categories.controller';
import { authMiddleware } from '@shared/middleware/auth.middleware';
import { requireRole } from '@shared/middleware/rbac.middleware';
import { validate } from '@shared/middleware/validate.middleware';
import { asyncHandler } from '@shared/middleware/error-handler.middleware';
import { createCategorySchema, updateCategorySchema } from './categories.validators';
import { ROLES } from '@shared/constants/roles';

const router = Router();

// Public reads (API Design Spec Section 9.4)
router.get('/', asyncHandler(categoriesController.list));
router.get('/:categoryId', asyncHandler(categoriesController.getById));

// Admin-only writes
router.post(
  '/',
  authMiddleware,
  requireRole(ROLES.ADMIN),
  validate(createCategorySchema),
  asyncHandler(categoriesController.create),
);
router.patch(
  '/:categoryId',
  authMiddleware,
  requireRole(ROLES.ADMIN),
  validate(updateCategorySchema),
  asyncHandler(categoriesController.update),
);
router.delete(
  '/:categoryId',
  authMiddleware,
  requireRole(ROLES.ADMIN),
  asyncHandler(categoriesController.remove),
);

export { router as categoriesRoutes };
