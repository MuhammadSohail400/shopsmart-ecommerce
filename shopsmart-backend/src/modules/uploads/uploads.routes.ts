import { Router } from 'express';
import { uploadsController } from './uploads.controller';
import { asyncHandler } from '@shared/middleware/error-handler.middleware';

export const uploadsRouter = Router();

uploadsRouter.post('/custom-design', asyncHandler(uploadsController.uploadCustomDesign));
