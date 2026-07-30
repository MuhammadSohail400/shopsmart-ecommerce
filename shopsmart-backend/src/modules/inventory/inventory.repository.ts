import { prisma } from '@config/database';

export const inventoryRepository = {
  findByVariantId(productVariantId: string) {
    return prisma.inventory.findUnique({ where: { productVariantId } });
  },

  create(productVariantId: string, quantity: number, lowStockThreshold = 5) {
    return prisma.inventory.create({
      data: { productVariantId, quantity, lowStockThreshold },
    });
  },

  /**
   * Optimistic-locking conditional update (DDD Section 14.1). Returns the
   * number of rows affected — 0 means either a version mismatch (concurrent
   * write) or insufficient stock, which the service layer distinguishes.
   */
  async conditionalUpdate(
    productVariantId: string,
    expectedVersion: number,
    data: { quantity?: number; lowStockThreshold?: number },
  ) {
    const result = await prisma.inventory.updateMany({
      where: { productVariantId, version: expectedVersion },
      data: { ...data, version: { increment: 1 } },
    });
    return result.count;
  },

  /**
   * Atomic decrement guarded by a non-negative check at the DB level
   * (DDD Section 14.1/14.4 — prevents overselling under concurrency).
   */
  async decrementStock(productVariantId: string, quantity: number) {
    const result = await prisma.inventory.updateMany({
      where: { productVariantId, quantity: { gte: quantity } },
      data: { quantity: { decrement: quantity }, version: { increment: 1 } },
    });
    return result.count > 0;
  },

  async restoreStock(productVariantId: string, quantity: number) {
    await prisma.inventory.update({
      where: { productVariantId },
      data: { quantity: { increment: quantity }, version: { increment: 1 } },
    });
  },

  listLowStock() {
    // Column-to-column comparison isn't expressible via Prisma's query
    // builder directly; a raw parameterized query is the pragmatic choice
    // here (DDD Section 7.8: parameterized queries only, no string concat).
    return prisma.$queryRaw`
      SELECT * FROM inventory WHERE quantity <= low_stock_threshold
    `;
  },
};
