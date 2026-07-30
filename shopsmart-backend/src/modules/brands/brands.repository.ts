import { prisma } from '@config/database';

export const brandsRepository = {
  findAll() {
    return prisma.brand.findMany({ where: { deletedAt: null }, orderBy: { name: 'asc' } });
  },
  findById(id: string) {
    return prisma.brand.findFirst({ where: { id, deletedAt: null } });
  },
  findBySlug(slug: string) {
    return prisma.brand.findFirst({ where: { slug, deletedAt: null } });
  },
  create(data: { name: string; slug: string }) {
    return prisma.brand.create({ data });
  },
  update(id: string, data: Partial<{ name: string; slug: string }>) {
    return prisma.brand.update({ where: { id }, data });
  },
  softDelete(id: string) {
    return prisma.brand.update({ where: { id }, data: { deletedAt: new Date() } });
  },
  countProducts(brandId: string) {
    return prisma.product.count({ where: { brandId, deletedAt: null } });
  },
};
