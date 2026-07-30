import { usersRepository } from './users.repository';
import { NotFoundError, AuthorizationError } from '@shared/errors';
import type { UpdateProfileBody, AddressBody } from './users.validators';

export const usersService = {
  async getProfile(userId: string) {
    const user = await usersRepository.findById(userId);
    if (!user) throw new NotFoundError('User');
    return user;
  },

  async updateProfile(userId: string, data: UpdateProfileBody) {
    return usersRepository.updateProfile(userId, data);
  },

  async deleteAccount(userId: string) {
    await usersRepository.softDelete(userId); // DDD Section 13.2: soft-deleted
  },

  async listAddresses(userId: string) {
    return usersRepository.listAddresses(userId);
  },

  async addAddress(userId: string, data: AddressBody) {
    return usersRepository.createAddress(userId, data);
  },

  async updateAddress(userId: string, addressId: string, data: Partial<AddressBody>) {
    const existing = await usersRepository.findAddress(addressId, userId);
    if (!existing) throw new NotFoundError('Address');
    if (existing.userId !== userId) throw new AuthorizationError(); // ownership check (Section 10.5)
    return usersRepository.updateAddress(addressId, userId, data);
  },

  async removeAddress(userId: string, addressId: string) {
    const existing = await usersRepository.findAddress(addressId, userId);
    if (!existing) throw new NotFoundError('Address');
    if (existing.userId !== userId) throw new AuthorizationError();
    await usersRepository.softDeleteAddress(addressId);
  },
};
