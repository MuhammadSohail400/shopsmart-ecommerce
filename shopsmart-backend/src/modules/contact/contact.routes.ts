import { Router } from 'express';
import { contactController } from './contact.controller';
import { validate } from '@shared/middleware/validate.middleware';
import { asyncHandler } from '@shared/middleware/error-handler.middleware';
import { createContactMessageSchema } from './contact.validators';

const router = Router();

router.post(
  '/',
  validate(createContactMessageSchema),
  asyncHandler(contactController.submit),
);

export { router as contactRoutes };
