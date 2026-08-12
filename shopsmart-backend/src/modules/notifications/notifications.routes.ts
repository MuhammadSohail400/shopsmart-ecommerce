import { Router } from 'express';
import { notificationsController } from './notifications.controller';
import { authMiddleware } from '@shared/middleware/auth.middleware';
import { requireRole } from '@shared/middleware/rbac.middleware';
import { validate } from '@shared/middleware/validate.middleware';
import { asyncHandler } from '@shared/middleware/error-handler.middleware';
import { updatePreferenceSchema, listLogsQuerySchema } from './notifications.validators';
import { ROLES } from '@shared/constants/roles';

const router = Router();

router.get(
  '/users/me/notification-preferences',
  authMiddleware,
  asyncHandler(notificationsController.getPreference),
);
router.patch(
  '/users/me/notification-preferences',
  authMiddleware,
  validate(updatePreferenceSchema),
  asyncHandler(notificationsController.updatePreference),
);

router.get(
  '/admin/notification-logs',
  authMiddleware,
  requireRole(ROLES.ADMIN),
  validate(listLogsQuerySchema, 'query'),
  asyncHandler(notificationsController.listLogs),
);

export { router as notificationsRoutes };
