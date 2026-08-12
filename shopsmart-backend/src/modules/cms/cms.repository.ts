import { prisma } from '@config/database';

export const cmsRepository = {
  // --- Pages ---
  findPageBySlug(slug: string) {
    return prisma.cmsPage.findFirst({ where: { slug, deletedAt: null } });
  },
  createPage(data: { slug: string; title: string; body: string }) {
    return prisma.cmsPage.create({ data });
  },
  updatePage(id: string, data: Partial<{ slug: string; title: string; body: string }>) {
    return prisma.cmsPage.update({ where: { id }, data });
  },
  findPageById(id: string) {
    return prisma.cmsPage.findFirst({ where: { id, deletedAt: null } });
  },

  // --- Banners ---
  listActiveBanners(now: Date) {
    return prisma.banner.findMany({
      where: { deletedAt: null, startDate: { lte: now }, endDate: { gte: now } },
      orderBy: { sortOrder: 'asc' },
    });
  },
  createBanner(data: { imageUrl: string; linkUrl?: string; startDate: Date; endDate: Date; sortOrder: number }) {
    return prisma.banner.create({ data });
  },
  findBannerById(id: string) {
    return prisma.banner.findFirst({ where: { id, deletedAt: null } });
  },
  updateBanner(id: string, data: Record<string, unknown>) {
    return prisma.banner.update({ where: { id }, data });
  },
  softDeleteBanner(id: string) {
    return prisma.banner.update({ where: { id }, data: { deletedAt: new Date() } });
  },

  // --- FAQ ---
  listFaq() {
    return prisma.faqEntry.findMany({ where: { deletedAt: null }, orderBy: { sortOrder: 'asc' } });
  },
  createFaq(data: { question: string; answer: string; sortOrder: number }) {
    return prisma.faqEntry.create({ data });
  },
  findFaqById(id: string) {
    return prisma.faqEntry.findFirst({ where: { id, deletedAt: null } });
  },
  updateFaq(id: string, data: Record<string, unknown>) {
    return prisma.faqEntry.update({ where: { id }, data });
  },
  softDeleteFaq(id: string) {
    return prisma.faqEntry.update({ where: { id }, data: { deletedAt: new Date() } });
  },
};
