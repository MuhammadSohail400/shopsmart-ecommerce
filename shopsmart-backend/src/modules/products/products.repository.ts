import { Prisma, ProductStatus } from '@prisma/client';
import { prisma } from '@config/database';

interface ListFilters {
  q?: string;
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  cursor?: string;
  limit: number;
}

export const productsRepository = {
  async list(filters: ListFilters) {
    const where: Prisma.ProductWhereInput = {
      deletedAt: null,
      status: ProductStatus.approved, // public listing only ever shows approved products
    };

    if (filters.q) {
      // FR-031/033: Postgres full-text-ish search via case-insensitive contains
      // at Phase 1-3 scope; upgraded to tsvector/GIN once the migration adds
      // the generated search column (DDD Section 7.6-7.7).
      where.OR = [
        { title: { contains: filters.q, mode: 'insensitive' } },
        { description: { contains: filters.q, mode: 'insensitive' } },
      ];
    }
    if (filters.category) where.category = { slug: filters.category };
    if (filters.brand) where.brand = { slug: filters.brand };
    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      where.basePrice = {
        ...(filters.minPrice !== undefined ? { gte: filters.minPrice } : {}),
        ...(filters.maxPrice !== undefined ? { lte: filters.maxPrice } : {}),
      };
    }

    const items = await prisma.product.findMany({
      where,
      take: filters.limit + 1, // fetch one extra to determine hasMore
      ...(filters.cursor ? { cursor: { id: filters.cursor }, skip: 1 } : {}),
      orderBy: { createdAt: 'desc' },
      include: { category: true, brand: true, variants: { include: { inventory: true } } },
    });

    const hasMore = items.length > filters.limit;
    return { items: items.slice(0, filters.limit), hasMore };
  },

  findById(idOrSlug: string, includeUnapproved = false) {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);
    const whereCondition = isUuid ? { id: idOrSlug } : { slug: idOrSlug };

    return prisma.product.findFirst({
      where: { ...whereCondition, deletedAt: null, ...(includeUnapproved ? {} : { status: ProductStatus.approved }) },
      include: { category: true, brand: true, variants: { include: { inventory: true } }, images: true },
    });
  },

  findByIdAnyStatus(idOrSlug: string) {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);
    const whereCondition = isUuid ? { id: idOrSlug } : { slug: idOrSlug };

    return prisma.product.findFirst({
      where: { ...whereCondition, deletedAt: null },
      include: { category: true, brand: true, variants: { include: { inventory: true } }, images: true },
    });
  },

  findBySlug(slug: string) {
    return prisma.product.findFirst({ where: { slug, deletedAt: null } });
  },

  create(data: {
    title: string;
    slug: string;
    description: string;
    basePrice: number;
    categoryId: string;
    brandId?: string;
  }) {
    return prisma.product.create({ data });
  },

  update(id: string, data: Prisma.ProductUpdateInput) {
    return prisma.product.update({ where: { id }, data });
  },

  softDelete(id: string) {
    return prisma.product.update({ where: { id }, data: { deletedAt: new Date() } });
  },

  // --- Variants ---

  findVariant(id: string, productId: string) {
    return prisma.productVariant.findFirst({ where: { id, productId, deletedAt: null } });
  },

  /** Used by Cart's guest-cart resolution — needs title/price without the parent product's ID in hand. */
  findVariantWithProduct(variantId: string) {
    return prisma.productVariant.findFirst({
      where: { id: variantId, deletedAt: null },
      include: { product: { include: { images: true } }, inventory: true },
    });
  },

  findVariantBySku(sku: string) {
    return prisma.productVariant.findFirst({ where: { sku, deletedAt: null } });
  },

  createVariant(productId: string, data: { sku: string; attributes: Record<string, string>; priceModifier: number }) {
    return prisma.productVariant.create({ data: { ...data, productId } });
  },

  updateVariant(id: string, data: Prisma.ProductVariantUpdateInput) {
    return prisma.productVariant.update({ where: { id }, data });
  },

  softDeleteVariant(id: string) {
    return prisma.productVariant.update({ where: { id }, data: { deletedAt: new Date() } });
  },

  // --- Images ---

  addImage(productId: string, data: { url: string; sortOrder: number }) {
    return prisma.productImage.create({ data: { ...data, productId } });
  },

  removeImage(id: string) {
    return prisma.productImage.delete({ where: { id } });
  },

  reorderImage(id: string, sortOrder: number) {
    return prisma.productImage.update({ where: { id }, data: { sortOrder } });
  },
};
