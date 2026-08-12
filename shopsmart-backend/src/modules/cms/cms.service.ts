import { cmsRepository } from './cms.repository';
import { NotFoundError, ConflictError } from '@shared/errors';
import type { CreatePageBody, CreateBannerBody, CreateFaqBody } from './cms.validators';

export const cmsService = {
  // --- Pages ---
  async getPageBySlug(slug: string) {
    const page = await cmsRepository.findPageBySlug(slug);
    if (!page) throw new NotFoundError('Page');
    return page;
  },

  async createPage(data: CreatePageBody) {
    const existing = await cmsRepository.findPageBySlug(data.slug);
    if (existing) throw new ConflictError('SLUG_ALREADY_EXISTS', 'A page with this slug already exists');
    return cmsRepository.createPage(data);
  },

  async updatePage(id: string, data: Partial<CreatePageBody>) {
    const existing = await cmsRepository.findPageById(id);
    if (!existing) throw new NotFoundError('Page');
    return cmsRepository.updatePage(id, data);
  },

  // --- Banners ---
  // FR-110: only banners within their active date range are returned publicly
  async listActiveBanners() {
    return cmsRepository.listActiveBanners(new Date());
  },

  async createBanner(data: CreateBannerBody) {
    return cmsRepository.createBanner(data);
  },

  async updateBanner(id: string, data: Record<string, unknown>) {
    const existing = await cmsRepository.findBannerById(id);
    if (!existing) throw new NotFoundError('Banner');
    return cmsRepository.updateBanner(id, data);
  },

  async removeBanner(id: string) {
    const existing = await cmsRepository.findBannerById(id);
    if (!existing) throw new NotFoundError('Banner');
    await cmsRepository.softDeleteBanner(id);
  },

  // --- FAQ ---
  async listFaq() {
    return cmsRepository.listFaq();
  },

  async createFaq(data: CreateFaqBody) {
    return cmsRepository.createFaq(data);
  },

  async updateFaq(id: string, data: Record<string, unknown>) {
    const existing = await cmsRepository.findFaqById(id);
    if (!existing) throw new NotFoundError('FAQ entry');
    return cmsRepository.updateFaq(id, data);
  },

  async removeFaq(id: string) {
    const existing = await cmsRepository.findFaqById(id);
    if (!existing) throw new NotFoundError('FAQ entry');
    await cmsRepository.softDeleteFaq(id);
  },
};
