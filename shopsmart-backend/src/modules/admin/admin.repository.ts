import { prisma } from '@config/database';
import { Role, Prisma } from '@prisma/client';

export const adminRepository = {
  listStaff() {
    return prisma.user.findMany({
      where: { role: { in: [Role.admin, Role.inventory_manager, Role.support_agent] }, deletedAt: null },
      select: { id: true, email: true, role: true, createdAt: true },
    });
  },

  countAdmins() {
    return prisma.user.count({ where: { role: Role.admin, deletedAt: null } });
  },

  findStaffById(id: string) {
    return prisma.user.findFirst({
      where: { id, role: { in: [Role.admin, Role.inventory_manager, Role.support_agent] }, deletedAt: null },
    });
  },

  findUserByEmail(email: string) {
    return prisma.user.findFirst({
      where: { email: email.toLowerCase().trim() },
    });
  },

  createStaff(email: string, passwordHash: string, role: Role) {
    return prisma.user.create({
      data: { email, passwordHash, role, emailVerified: true }, // staff accounts are pre-verified
      select: { id: true, email: true, role: true, createdAt: true },
    });
  },

  updateRole(id: string, role: Role) {
    return prisma.user.update({ where: { id }, data: { role } });
  },

  // --- Dashboard summary (read-only aggregation across owned modules) ---

  async orderCountsByStatus(): Promise<Record<string, number>> {
    const results = (await prisma.order.groupBy({
      by: ['status'],
      _count: { status: true },
    })) as unknown as Array<{ status: string; _count: { status: number } }>;
    return results.reduce((acc: Record<string, number>, r) => {
      acc[r.status] = r._count.status;
      return acc;
    }, {});
  },

  async totalRevenue() {
    const result = await prisma.order.aggregate({
      where: { status: { in: ['confirmed', 'processing', 'shipped', 'delivered'] } },
      _sum: { totalAmount: true },
    });
    return Number(result._sum.totalAmount ?? 0);
  },

  countLowStockItems() {
    return prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(*) as count FROM inventory WHERE quantity <= low_stock_threshold
    `;
  },

  countProducts() {
    return prisma.product.count({ where: { deletedAt: null } });
  },

  countCustomers() {
    return prisma.user.count({ where: { role: 'customer', deletedAt: null } });
  },

  countCustomOrders() {
    return prisma.orderItem.count({
      where: {
        customConfig: {
          not: Prisma.DbNull,
        },
      },
    });
  },
};
