import { z } from 'zod';
import { emailSchema, passwordSchema } from '@shared/utils/validation-primitives';

export const createStaffSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  role: z.enum(['admin', 'inventory_manager', 'support_agent']),
});
export type CreateStaffBody = z.infer<typeof createStaffSchema>;

export const updateStaffRoleSchema = z.object({
  role: z.enum(['admin', 'inventory_manager', 'support_agent']),
});
