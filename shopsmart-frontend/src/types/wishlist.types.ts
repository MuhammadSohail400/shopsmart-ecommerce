import type { Product } from '@/services/products.service';

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
