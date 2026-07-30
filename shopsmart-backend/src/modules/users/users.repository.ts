import { prisma } from '@config/database';
import type { AddressBody } from './users.validators';

export const usersRepository = {
  findById(id: string) {
    return prisma.user.findFirst({ where: { id, deletedAt: null } });
  },

  updateProfile(id: string, data: { email?: string; phone?: string }) {
    return prisma.user.update({ where: { id }, data });
  },

  softDelete(id: string) {
    return prisma.user.update({ where: { id }, data: { deletedAt: new Date() } });
  },

  // --- Addresses (DDD Section 2.2) ---

  listAddresses(userId: string) {
    return prisma.address.findMany({
      where: { userId, deletedAt: null },
      orderBy: [{ isDefault: 'desc' }],
    });
  },

  findAddress(id: string, userId: string) {
    return prisma.address.findFirst({ where: { id, userId, deletedAt: null } });
  },

  async createAddress(userId: string, data: AddressBody) {
    if (data.isDefault) {
      await prisma.address.updateMany({ where: { userId }, data: { isDefault: false } });
    }
    return prisma.address.create({ data: { ...data, userId } });
  },

  async updateAddress(id: string, userId: string, data: Partial<AddressBody>) {
    if (data.isDefault) {
      await prisma.address.updateMany({ where: { userId }, data: { isDefault: false } });
    }
    return prisma.address.update({ where: { id }, data });
  },

  softDeleteAddress(id: string) {
    return prisma.address.update({ where: { id }, data: { deletedAt: new Date() } });
  },
};
