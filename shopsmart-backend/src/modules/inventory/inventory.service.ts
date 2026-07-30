import { inventoryRepository } from './inventory.repository';
import { NotFoundError, PreconditionFailedError, ConflictError } from '@shared/errors';
import type { UpdateInventoryBody } from './inventory.validators';

export const inventoryService = {
  async getByVariantId(productVariantId: string) {
    const inventory = await inventoryRepository.findByVariantId(productVariantId);
    if (!inventory) throw new NotFoundError('Inventory record');
    return inventory;
  },

  // API Design Spec Section 9.9: PATCH requires If-Match: <version>
  async update(productVariantId: string, expectedVersion: number, data: UpdateInventoryBody) {
    const current = await inventoryRepository.findByVariantId(productVariantId);
    if (!current) throw new NotFoundError('Inventory record');

    const affected = await inventoryRepository.conditionalUpdate(productVariantId, expectedVersion, data);
    if (affected === 0) {
      throw new PreconditionFailedError(
        'The inventory record was modified by someone else. Refresh and try again.',
      );
    }
    return inventoryRepository.findByVariantId(productVariantId);
  },

  // Used by FR-019/FR-044 (Cart) and, later, FR-080/FR-081 (Order creation)
  async checkAvailability(productVariantId: string, quantity: number): Promise<boolean> {
    const inventory = await inventoryRepository.findByVariantId(productVariantId);
    if (!inventory) return false;
    return inventory.quantity - inventory.reservedQuantity >= quantity;
  },

  // BR-001/FR-080/NFR-009: atomic, cannot oversell under concurrency
  async decrementStock(productVariantId: string, quantity: number) {
    const success = await inventoryRepository.decrementStock(productVariantId, quantity);
    if (!success) {
      throw new ConflictError('INSUFFICIENT_STOCK', 'This item no longer has enough stock available');
    }
  },

  // FR-082: restore on cancellation/approved return
  async restoreStock(productVariantId: string, quantity: number) {
    await inventoryRepository.restoreStock(productVariantId, quantity);
  },

  async listLowStock() {
    return inventoryRepository.listLowStock();
  },
};
