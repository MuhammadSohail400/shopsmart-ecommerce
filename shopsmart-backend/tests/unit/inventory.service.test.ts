import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../src/modules/inventory/inventory.repository', () => ({
  inventoryRepository: {
    findByVariantId: vi.fn(),
    create: vi.fn(),
    conditionalUpdate: vi.fn(),
    decrementStock: vi.fn(),
    restoreStock: vi.fn(),
    listLowStock: vi.fn(),
  },
}));

import { inventoryRepository } from '../../src/modules/inventory/inventory.repository';
import { inventoryService } from '../../src/modules/inventory/inventory.service';

describe('inventoryService.checkAvailability', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns true when quantity minus reserved covers the requested amount', async () => {
    (inventoryRepository.findByVariantId as ReturnType<typeof vi.fn>).mockResolvedValue({
      quantity: 10,
      reservedQuantity: 2,
    });
    expect(await inventoryService.checkAvailability('variant-1', 5)).toBe(true);
  });

  it('returns false when reserved stock eats into what is requested', async () => {
    (inventoryRepository.findByVariantId as ReturnType<typeof vi.fn>).mockResolvedValue({
      quantity: 10,
      reservedQuantity: 8,
    });
    expect(await inventoryService.checkAvailability('variant-1', 5)).toBe(false);
  });

  it('returns false when no inventory record exists at all', async () => {
    (inventoryRepository.findByVariantId as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    expect(await inventoryService.checkAvailability('unknown-variant', 1)).toBe(false);
  });
});

describe('inventoryService.decrementStock (BR-001/NFR-009 — cannot oversell under concurrency)', () => {
  beforeEach(() => vi.clearAllMocks());

  it('succeeds silently when the conditional decrement affects a row', async () => {
    (inventoryRepository.decrementStock as ReturnType<typeof vi.fn>).mockResolvedValue(true);
    await expect(inventoryService.decrementStock('variant-1', 3)).resolves.toBeUndefined();
  });

  it('throws INSUFFICIENT_STOCK when the conditional decrement affects zero rows (lost the race, or genuinely out of stock)', async () => {
    (inventoryRepository.decrementStock as ReturnType<typeof vi.fn>).mockResolvedValue(false);
    await expect(inventoryService.decrementStock('variant-1', 3)).rejects.toMatchObject({
      code: 'INSUFFICIENT_STOCK',
      statusCode: 409,
    });
  });
});

describe('inventoryService.update (optimistic locking, DDD Section 14.1)', () => {
  beforeEach(() => vi.clearAllMocks());

  it('throws PRECONDITION_FAILED when the version has moved since the client last read it', async () => {
    (inventoryRepository.findByVariantId as ReturnType<typeof vi.fn>).mockResolvedValue({
      productVariantId: 'variant-1',
      version: 5,
    });
    (inventoryRepository.conditionalUpdate as ReturnType<typeof vi.fn>).mockResolvedValue(0); // no rows affected — version mismatch

    await expect(
      inventoryService.update('variant-1', 3 /* stale version */, { quantity: 20 }),
    ).rejects.toMatchObject({ statusCode: 412 });
  });

  it('succeeds and returns the updated record when the version matches', async () => {
    (inventoryRepository.findByVariantId as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({ productVariantId: 'variant-1', version: 5 })
      .mockResolvedValueOnce({ productVariantId: 'variant-1', version: 6, quantity: 20 });
    (inventoryRepository.conditionalUpdate as ReturnType<typeof vi.fn>).mockResolvedValue(1);

    const result = await inventoryService.update('variant-1', 5, { quantity: 20 });
    expect(result?.quantity).toBe(20);
  });

  it('throws NOT_FOUND for a variant with no inventory record', async () => {
    (inventoryRepository.findByVariantId as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    await expect(inventoryService.update('unknown', 0, { quantity: 1 })).rejects.toMatchObject({
      code: 'NOT_FOUND',
    });
  });
});
