import { z } from 'zod';

export const createContactMessageSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be 100 characters or fewer'),
  email: z.string().email('Please provide a valid email address'),
  subject: z.string().min(1, 'Subject is required').max(200, 'Subject must be 200 characters or fewer'),
  message: z.string().min(5, 'Message must be at least 5 characters').max(3000, 'Message must be 3000 characters or fewer'),
});

export type CreateContactMessageBody = z.infer<typeof createContactMessageSchema>;
