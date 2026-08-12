import { z } from 'zod';

export const listAuditLogsQuerySchema = z.object({
  entityType: z.string().optional(),
  actorId: z.string().uuid().optional(),
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
