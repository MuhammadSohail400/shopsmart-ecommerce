import { apiClient } from '@/lib/api-client';
import { CartView } from '@/types/cart.types';

export const cartService = {
  getCart: async (): Promise<CartView> => {
    return apiClient<CartView>('/cart');
  },
  
  addItem: async (productVariantId: string, quantity: number): Promise<CartView> => {
    return apiClient<CartView>('/cart/items', {
      method: 'POST',
      body: JSON.stringify({ productVariantId, quantity }),
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
};
