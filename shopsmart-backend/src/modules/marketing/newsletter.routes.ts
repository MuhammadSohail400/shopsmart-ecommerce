import { Router } from 'express';
import { newsletterController } from './newsletter.controller';
import { validate } from '@shared/middleware/validate.middleware';
import { asyncHandler } from '@shared/middleware/error-handler.middleware';
import { subscribeNewsletterSchema } from './newsletter.validators';

const router = Router();

router.post(
  '/subscribe',
  validate(subscribeNewsletterSchema),
  asyncHandler(newsletterController.subscribe),
);

export { router as newsletterRoutes };
