import { apiClient } from '@/lib/api-client';
import { CartView, CustomConfig } from '@/types/cart.types';

export const cartService = {
  getCart: async (): Promise<CartView> => {
    return apiClient<CartView>('/cart');
  },
  
  addItem: async (productVariantId: string, quantity: number, customConfig?: Partial<CustomConfig>): Promise<CartView> => {
    return apiClient<CartView>('/cart/items', {
      method: 'POST',
      body: JSON.stringify({ productVariantId, quantity, customConfig }),
    });
  },
  
  updateItem: async (itemId: string, quantity: number): Promise<CartView> => {
    return apiClient<CartView>(`/cart/items/${itemId}`, {
      method: 'PATCH',
      body: JSON.stringify({ quantity }),
    });
  },
  
  removeItem: async (itemId: string): Promise<CartView> => {
    return apiClient<CartView>(`/cart/items/${itemId}`, {
      method: 'DELETE',
    });
  },
  
  clearCart: async (): Promise<void> => {
    return apiClient<void>('/cart', {
      method: 'DELETE',
    });
  },

  mergeCart: async (guestCartId?: string): Promise<CartView> => {
    return apiClient<CartView>('/cart/merge', {
      method: 'POST',
      body: JSON.stringify({ guestCartId }),
    });
  },
};
