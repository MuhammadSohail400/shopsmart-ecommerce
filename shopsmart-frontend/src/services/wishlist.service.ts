import { apiClient } from '@/lib/api-client';
import { WishlistView } from '@/types/wishlist.types';

export const wishlistService = {
  getWishlist: async (): Promise<WishlistView> => {
    return apiClient<WishlistView>('/wishlist');
  },

  addItem: async (productId: string): Promise<WishlistView> => {
    return apiClient<WishlistView>('/wishlist/items', {
      method: 'POST',
      body: JSON.stringify({ productId }),
    });
  },

  removeItem: async (productId: string): Promise<void> => {
    return apiClient<void>(`/wishlist/items/${productId}`, {
      method: 'DELETE',
    });
  },

  moveToCart: async (productId: string, productVariantId: string, quantity = 1): Promise<void> => {
    return apiClient<void>(`/wishlist/items/${productId}/move-to-cart`, {
      method: 'POST',
      body: JSON.stringify({ productVariantId, quantity }),
    });
  },
};
