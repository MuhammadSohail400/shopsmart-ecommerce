import { Router } from 'express';
import { cmsController } from './cms.controller';
import { authMiddleware } from '@shared/middleware/auth.middleware';
import { requireRole } from '@shared/middleware/rbac.middleware';
import { validate } from '@shared/middleware/validate.middleware';
import { asyncHandler } from '@shared/middleware/error-handler.middleware';
import { createPageSchema, updatePageSchema, createBannerSchema, updateBannerSchema, createFaqSchema, updateFaqSchema } from './cms.validators';
import { ROLES } from '@shared/constants/roles';

const router = Router();
const adminOnly = [authMiddleware, requireRole(ROLES.ADMIN)];

// Public reads
router.get('/pages/:slug', asyncHandler(cmsController.getPageBySlug));
router.get('/banners', asyncHandler(cmsController.listBanners));
router.get('/faq', asyncHandler(cmsController.listFaq));

// Admin writes
router.post('/pages', ...adminOnly, validate(createPageSchema), asyncHandler(cmsController.createPage));
router.patch('/pages/:pageId', ...adminOnly, validate(updatePageSchema), asyncHandler(cmsController.updatePage));

router.post('/banners', ...adminOnly, validate(createBannerSchema), asyncHandler(cmsController.createBanner));
router.patch('/banners/:bannerId', ...adminOnly, validate(updateBannerSchema), asyncHandler(cmsController.updateBanner));
router.delete('/banners/:bannerId', ...adminOnly, asyncHandler(cmsController.removeBanner));

router.post('/faq', ...adminOnly, validate(createFaqSchema), asyncHandler(cmsController.createFaq));
router.patch('/faq/:faqId', ...adminOnly, validate(updateFaqSchema), asyncHandler(cmsController.updateFaq));
router.delete('/faq/:faqId', ...adminOnly, asyncHandler(cmsController.removeFaq));

export { router as cmsRoutes };
