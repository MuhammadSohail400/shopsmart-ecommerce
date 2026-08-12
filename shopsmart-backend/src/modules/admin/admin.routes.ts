import { Router } from 'express';
import { adminController } from './admin.controller';
import { authMiddleware } from '@shared/middleware/auth.middleware';
import { requireRole } from '@shared/middleware/rbac.middleware';
import { validate } from '@shared/middleware/validate.middleware';
import { asyncHandler } from '@shared/middleware/error-handler.middleware';
import { createStaffSchema, updateStaffRoleSchema } from './admin.validators';
import { ROLES, STAFF_ROLES } from '@shared/constants/roles';

const router = Router();
router.use(authMiddleware);

router.get('/dashboard/summary', requireRole(...STAFF_ROLES), asyncHandler(adminController.getDashboardSummary));
router.get('/orders', requireRole(ROLES.ADMIN, ROLES.SUPPORT_AGENT), asyncHandler(adminController.listOrders));

router.get('/staff', requireRole(ROLES.ADMIN), asyncHandler(adminController.listStaff));
router.post('/staff', requireRole(ROLES.ADMIN), validate(createStaffSchema), asyncHandler(adminController.createStaff));
router.patch(
  '/staff/:staffId/role',
  requireRole(ROLES.ADMIN),
  validate(updateStaffRoleSchema),
  asyncHandler(adminController.updateStaffRole),
);

export { router as adminRoutes };
