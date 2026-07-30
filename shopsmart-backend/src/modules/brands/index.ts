/**
 * Brands Module — public interface.
 * Responsibility: brand taxonomy for products.
 * Dependencies: none.
 */
export { brandsRoutes } from './brands.routes';

export async function getBrandById(id: string) {
  const { brandsRepository } = await import('./brands.repository');
  return brandsRepository.findById(id);
}
