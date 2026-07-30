/**
 * Products Module — public interface.
 * Responsibility: product/variant/image catalog management.
 * Dependencies: categories, brands, inventory (all via their public interfaces).
 */
export { productsRoutes } from './products.routes';

export async function getProductById(id: string) {
  const { productsService } = await import('./products.service');
  return productsService.getById(id);
}

export async function isProductPurchasable(productId: string, variantId: string, quantity: number) {
  const { productsService } = await import('./products.service');
  return productsService.isPurchasable(productId, variantId, quantity);
}

/** Used by Cart to resolve title/price for guest-cart line items (Redis stores only IDs). */
export async function getVariantById(variantId: string) {
  const { productsRepository } = await import('./products.repository');
  return productsRepository.findVariantWithProduct(variantId);
}
