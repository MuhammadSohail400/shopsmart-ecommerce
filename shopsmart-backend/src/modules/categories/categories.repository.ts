import { prisma } from '@config/database';

export const categoriesRepository = {
  findAll() {
    return prisma.category.findMany({
      where: { deletedAt: null },
      orderBy: { name: 'asc' },
    });
  },

  findById(id: string) {
    return prisma.category.findFirst({ where: { id, deletedAt: null } });
  },

  findBySlug(slug: string) {
    return prisma.category.findFirst({ where: { slug, deletedAt: null } });
  },

  async create(data: { name: string; slug: string; parentId?: string }) {
    let depth = 0;
    if (data.parentId) {
      const parent = await prisma.category.findUnique({ where: { id: data.parentId } });
      depth = (parent?.depth ?? 0) + 1;
    }
    return prisma.category.create({ data: { ...data, depth } });
  },

  update(id: string, data: Partial<{ name: string; slug: string; parentId: string }>) {
    return prisma.category.update({ where: { id }, data });
  },

  softDelete(id: string) {
    return prisma.category.update({ where: { id }, data: { deletedAt: new Date() } });
  },

  countProducts(categoryId: string) {
    return prisma.product.count({ where: { categoryId, deletedAt: null } });
  },
};
