/**
 * Inventory Module — public interface.
 * Responsibility: sole owner of all stock-mutating logic (Backend
 * Standards Section 4). No other module writes to Inventory directly.
 * Dependencies: none (products references it read-only).
 */
export { inventoryRoutes } from './inventory.routes';
export { inventoryRepository } from './inventory.repository';

export async function checkAvailability(productVariantId: string, quantity: number) {
  const { inventoryService } = await import('./inventory.service');
  return inventoryService.checkAvailability(productVariantId, quantity);
}

export async function decrementStock(productVariantId: string, quantity: number) {
  const { inventoryService } = await import('./inventory.service');
  return inventoryService.decrementStock(productVariantId, quantity);
}

export async function restoreStock(productVariantId: string, quantity: number) {
  const { inventoryService } = await import('./inventory.service');
  return inventoryService.restoreStock(productVariantId, quantity);
}

/** Called by the Products module when a new variant is created (Section 4). */
export async function initializeStock(productVariantId: string, initialQuantity: number) {
  const { inventoryRepository } = await import('./inventory.repository');
  return inventoryRepository.create(productVariantId, initialQuantity);
}
