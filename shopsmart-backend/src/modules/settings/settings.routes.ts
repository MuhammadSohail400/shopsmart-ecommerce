import { Router } from 'express';
import { settingsController } from './settings.controller';
import { authMiddleware } from '@shared/middleware/auth.middleware';
import { requireRole } from '@shared/middleware/rbac.middleware';
import { validate } from '@shared/middleware/validate.middleware';
import { asyncHandler } from '@shared/middleware/error-handler.middleware';
import { updateSettingSchema, createTaxRuleSchema } from './settings.validators';
import { ROLES } from '@shared/constants/roles';

const router = Router();

// Public: Storefront dynamic brand, currency & helpline info
router.get('/public', asyncHandler(settingsController.getPublicStoreInfo));

// Admin-guarded settings operations
router.use(authMiddleware, requireRole(ROLES.ADMIN));

router.get('/', asyncHandler(settingsController.list));
router.patch('/', validate(updateSettingSchema), asyncHandler(settingsController.update));
router.patch('/bulk', asyncHandler(settingsController.updateBulk));

router.get('/tax-rules', asyncHandler(settingsController.listTaxRules));
router.post('/tax-rules', validate(createTaxRuleSchema), asyncHandler(settingsController.createTaxRule));
router.delete('/tax-rules/:id', asyncHandler(settingsController.deleteTaxRule));

export { router as settingsRoutes };
