import { z } from 'zod';
import { emailSchema, passwordSchema, phoneSchema } from '@shared/utils/validation-primitives';

// VR-001-004: at least one of email/phone required (Section 15.1 of PRD)
export const registerSchema = z
  .object({
    email: emailSchema.optional(),
    phone: phoneSchema.optional(),
    password: passwordSchema,
  })
  .refine((data) => data.email || data.phone, {
    message: 'Either email or phone is required',
    path: ['email'],
  })
  .refine((data) => !(data.password && (data.email === data.password || data.phone === data.password)), {
    message: 'Password cannot match your email or phone', // VR-002
    path: ['password'],
  });
export type RegisterBody = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  identifier: z.string().min(3),
  password: z.string().min(1),
});
export type LoginBody = z.infer<typeof loginSchema>;

export const passwordResetRequestSchema = z.object({
  identifier: z.string().min(3),
});

export const passwordResetConfirmSchema = z.object({
  token: z.string().min(1),
  newPassword: passwordSchema,
});

export const verifyEmailSchema = z.object({
  token: z.string().min(1),
});

export const verifyPhoneSchema = z.object({
  userId: z.string().uuid(),
  code: z.string().length(6),
});
