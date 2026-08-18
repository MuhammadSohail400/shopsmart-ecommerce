import { apiClient } from '@/lib/api-client';

export interface LowStockItem {
  id: string;
  sku: string;
  attributes: Record<string, string>;
  product: {
    id: string;
    title: string;
    slug: string;
  };
  inventory: {
    id: string;
    quantity: number;
    reservedQuantity: number;
    lowStockThreshold: number;
    version: number;
  };
}

export interface UpdateInventoryInput {
  quantity?: number;
  reservedQuantity?: number;
  lowStockThreshold?: number;
  version: number; // Required for optimistic concurrency check
}

export const adminInventoryService = {
  async getLowStock(): Promise<LowStockItem[]> {
    return apiClient<LowStockItem[]>('/inventory/low-stock');
  },

  async getInventory(variantId: string): Promise<any> {
    return apiClient(`/inventory/${variantId}`);
  },

  async updateInventory(variantId: string, data: UpdateInventoryInput): Promise<any> {
    return apiClient(`/inventory/${variantId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },
};
