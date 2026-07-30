import { Router } from 'express';
import { brandsController } from './brands.controller';
import { authMiddleware } from '@shared/middleware/auth.middleware';
import { requireRole } from '@shared/middleware/rbac.middleware';
import { validate } from '@shared/middleware/validate.middleware';
import { asyncHandler } from '@shared/middleware/error-handler.middleware';
import { createBrandSchema, updateBrandSchema } from './brands.validators';
import { ROLES } from '@shared/constants/roles';

const router = Router();

router.get('/', asyncHandler(brandsController.list));
router.get('/:brandId', asyncHandler(brandsController.getById));

router.post(
  '/',
  authMiddleware,
  requireRole(ROLES.ADMIN),
  validate(createBrandSchema),
  asyncHandler(brandsController.create),
);
router.patch(
  '/:brandId',
  authMiddleware,
  requireRole(ROLES.ADMIN),
  validate(updateBrandSchema),
  asyncHandler(brandsController.update),
);
router.delete('/:brandId', authMiddleware, requireRole(ROLES.ADMIN), asyncHandler(brandsController.remove));

export { router as brandsRoutes };
