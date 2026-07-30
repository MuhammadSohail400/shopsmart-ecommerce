import { Router } from 'express';
import { usersController } from './users.controller';
import { authMiddleware } from '@shared/middleware/auth.middleware';
import { validate } from '@shared/middleware/validate.middleware';
import { asyncHandler } from '@shared/middleware/error-handler.middleware';
import { updateProfileSchema, addressSchema, updateAddressSchema } from './users.validators';

const router = Router();
router.use(authMiddleware); // every route in this module requires auth

router.get('/me', asyncHandler(usersController.getMe));
router.patch('/me', validate(updateProfileSchema), asyncHandler(usersController.updateMe));
router.delete('/me', asyncHandler(usersController.deleteMe));

router.get('/me/addresses', asyncHandler(usersController.listAddresses));
router.post('/me/addresses', validate(addressSchema), asyncHandler(usersController.addAddress));
router.patch(
  '/me/addresses/:addressId',
  validate(updateAddressSchema),
  asyncHandler(usersController.updateAddress),
);
router.delete('/me/addresses/:addressId', asyncHandler(usersController.removeAddress));

export { router as usersRoutes };
