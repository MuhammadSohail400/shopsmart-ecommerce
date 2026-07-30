import { z } from 'zod';
import { uuidSchema } from '@shared/utils/validation-primitives';

const guestAddressSchema = z.object({
  fullName: z.string().min(1).max(255),
  phone: z.string().min(1),
  line1: z.string().min(1).max(255),
  city: z.string().min(1).max(100),
  region: z.string().min(1).max(100),
  postalCode: z.string().max(20).optional(),
  country: z.string().length(2),
});

export const createSessionSchema = z
  .object({
    addressId: uuidSchema.optional(), // registered users: pick a saved address
    guestAddress: guestAddressSchema.optional(), // guests: inline address
    shippingMethod: z.enum(['standard', 'express']),
  })
  .refine((data) => data.addressId || data.guestAddress, {
    message: 'Either addressId or guestAddress is required',
    path: ['addressId'],
  });
export type CreateSessionBody = z.infer<typeof createSessionSchema>;

export const confirmSessionSchema = z.object({
  paymentMethod: z.enum(['card', 'cod', 'bank_transfer']),
});
export type ConfirmSessionBody = z.infer<typeof confirmSessionSchema>;
