import { z } from 'zod';
import { emailSchema, phoneSchema } from '@shared/utils/validation-primitives';

export const updateProfileSchema = z.object({
  email: emailSchema.optional(),
  phone: phoneSchema.optional(),
});
export type UpdateProfileBody = z.infer<typeof updateProfileSchema>;

// VR-005: required address fields
export const addressSchema = z.object({
  fullName: z.string().min(1).max(255),
  phone: phoneSchema,
  line1: z.string().min(1).max(255),
  city: z.string().min(1).max(100),
  region: z.string().min(1).max(100),
  postalCode: z.string().max(20).optional(),
  country: z.string().min(1).max(100),
  isDefault: z.boolean().optional().default(false),
});
export type AddressBody = z.infer<typeof addressSchema>;

export const updateAddressSchema = addressSchema.partial();
