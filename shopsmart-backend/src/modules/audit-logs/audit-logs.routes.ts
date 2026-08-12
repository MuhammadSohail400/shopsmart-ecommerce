import { Router } from 'express';
import { auditLogsController } from './audit-logs.controller';
import { authMiddleware } from '@shared/middleware/auth.middleware';
import { requireRole } from '@shared/middleware/rbac.middleware';
import { validate } from '@shared/middleware/validate.middleware';
import { asyncHandler } from '@shared/middleware/error-handler.middleware';
import { listAuditLogsQuerySchema } from './audit-logs.validators';
import { ROLES } from '@shared/constants/roles';

const router = Router();

router.get(
  '/',
  authMiddleware,
  requireRole(ROLES.ADMIN),
  validate(listAuditLogsQuerySchema, 'query'),
  asyncHandler(auditLogsController.list),
);

export { router as auditLogsRoutes };
