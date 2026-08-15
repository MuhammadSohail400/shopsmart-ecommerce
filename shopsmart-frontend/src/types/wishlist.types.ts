import type { Product } from '@/types/product.types';

export interface WishlistItem {
  productId: string;
  product: Product;
  addedAt: string;
}

export interface WishlistView {
  id: string;
  userId: string;
  items: WishlistItem[];
}
