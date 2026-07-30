import { Router } from 'express';
import { inventoryController } from './inventory.controller';
import { authMiddleware } from '@shared/middleware/auth.middleware';
import { requireRole } from '@shared/middleware/rbac.middleware';
import { validate } from '@shared/middleware/validate.middleware';
import { asyncHandler } from '@shared/middleware/error-handler.middleware';
import { updateInventorySchema } from './inventory.validators';
import { ROLES } from '@shared/constants/roles';

const router = Router();
router.use(authMiddleware, requireRole(ROLES.ADMIN, ROLES.INVENTORY_MANAGER));

router.get('/low-stock', asyncHandler(inventoryController.listLowStock));
router.get('/:variantId', asyncHandler(inventoryController.getByVariantId));
router.patch('/:variantId', validate(updateInventorySchema), asyncHandler(inventoryController.update));

export { router as inventoryRoutes };
