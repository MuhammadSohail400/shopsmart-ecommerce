import { Router } from 'express';
import { productsController } from './products.controller';
import { authMiddleware } from '@shared/middleware/auth.middleware';
import { requireRole } from '@shared/middleware/rbac.middleware';
import { validate } from '@shared/middleware/validate.middleware';
import { asyncHandler } from '@shared/middleware/error-handler.middleware';
import { rateLimit } from '@shared/middleware/rate-limit.middleware';
import {
  createProductSchema,
  updateProductSchema,
  listProductsQuerySchema,
  createVariantSchema,
  updateVariantSchema,
  addImageSchema,
  reorderImageSchema,
} from './products.validators';
import { CATALOG_MANAGER_ROLES } from '@shared/constants/roles';

const router = Router();
const catalogWrite = [authMiddleware, requireRole(...CATALOG_MANAGER_ROLES)];

// Public reads — elevated rate limit ceiling (API Design Spec Section 16)
const browseLimit = rateLimit({ windowSeconds: 60, max: 100, keyPrefix: 'products-browse' });
router.get('/', browseLimit, validate(listProductsQuerySchema, 'query'), asyncHandler(productsController.list));
router.get('/:productId', asyncHandler(productsController.getById));

// Admin/Inventory Manager writes
router.post('/', ...catalogWrite, validate(createProductSchema), asyncHandler(productsController.create));
router.patch(
  '/:productId',
  ...catalogWrite,
  validate(updateProductSchema),
  asyncHandler(productsController.update),
);
router.delete('/:productId', ...catalogWrite, asyncHandler(productsController.remove));

// Variants (sub-resource, API Design Spec Section 9.8)
router.post(
  '/:productId/variants',
  ...catalogWrite,
  validate(createVariantSchema),
  asyncHandler(productsController.addVariant),
);
router.patch(
  '/:productId/variants/:variantId',
  ...catalogWrite,
  validate(updateVariantSchema),
  asyncHandler(productsController.updateVariant),
);
router.delete(
  '/:productId/variants/:variantId',
  ...catalogWrite,
  asyncHandler(productsController.removeVariant),
);

// Images (sub-resource, API Design Spec Section 9.7)
router.post(
  '/:productId/images',
  ...catalogWrite,
  validate(addImageSchema),
  asyncHandler(productsController.addImage),
);
router.delete('/:productId/images/:imageId', ...catalogWrite, asyncHandler(productsController.removeImage));
router.patch(
  '/:productId/images/:imageId/reorder',
  ...catalogWrite,
  validate(reorderImageSchema),
  asyncHandler(productsController.reorderImage),
);

export { router as productsRoutes };
