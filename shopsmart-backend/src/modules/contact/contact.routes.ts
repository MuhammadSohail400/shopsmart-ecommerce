import { Router } from 'express';
import { contactController } from './contact.controller';
import { validate } from '@shared/middleware/validate.middleware';
import { asyncHandler } from '@shared/middleware/error-handler.middleware';
import { authMiddleware } from '@shared/middleware/auth.middleware';
import { requireRole } from '@shared/middleware/rbac.middleware';
import { ROLES } from '@shared/constants/roles';
import { createContactMessageSchema } from './contact.validators';

const router = Router();

// Public: Submit a message
router.post(
  '/',
  validate(createContactMessageSchema),
  asyncHandler(contactController.submit),
);

// Admin / Staff: List, update, delete inquiries
router.get(
  '/messages',
  authMiddleware,
  requireRole(ROLES.ADMIN, ROLES.SUPPORT_AGENT),
  asyncHandler(contactController.list),
);

router.patch(
  '/messages/:id/status',
  authMiddleware,
  requireRole(ROLES.ADMIN, ROLES.SUPPORT_AGENT),
  asyncHandler(contactController.updateStatus),
);

router.delete(
  '/messages/:id',
  authMiddleware,
  requireRole(ROLES.ADMIN),
  asyncHandler(contactController.delete),
);

export { router as contactRoutes };
