/**
 * Users Module — public interface.
 * Responsibility: profile and saved-address management.
 * Dependencies: auth (for identity).
 */
export { usersRoutes } from './users.routes';
export { usersRepository } from './users.repository';

export async function getDefaultAddress(userId: string) {
  const { usersRepository } = await import('./users.repository');
  const addresses = await usersRepository.listAddresses(userId);
  return addresses.find((a: { isDefault: boolean }) => a.isDefault) ?? addresses[0] ?? null;
}

/** Used by Checkout to resolve and validate ownership of a selected address. */
export async function getAddressForUser(userId: string, addressId: string) {
  const { usersRepository } = await import('./users.repository');
  return usersRepository.findAddress(addressId, userId);
}
