import { apiClient } from '@/lib/api-client';

export interface Category {
  id: string;
  parentId?: string | null;
  name: string;
  slug: string;
  depth: number;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
}

export interface Inventory {
  id: string;
  productVariantId: string;
  quantity: number;
  reservedQuantity: number;
  lowStockThreshold: number;
  version: number;
}

export interface ProductVariant {
  id: string;
  productId: string;
  sku: string;
  attributes: Record<string, string>;
  priceModifier: string; // Decimals are returned as strings in JSON
  inventory?: Inventory | null;
}

export interface ProductImage {
  id: string;
  productId: string;
  url: string;
  sortOrder: number;
}

export interface Product {
  id: string;
  categoryId: string;
  brandId?: string | null;
  title: string;
  slug: string;
  description: string;
  basePrice: string; // Decimals are returned as strings in JSON
  status: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  
  category: Category;
  brand?: Brand | null;
  variants: ProductVariant[];
  images?: ProductImage[]; // Only present in single product fetch
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    nextCursor: string | null;
    hasMore: boolean;
    limit: number;
  };
}

export interface ProductFilters {
  q?: string;
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  sort?: string;
  cursor?: string;
  limit?: number;
}

export const productsService = {
  async getProducts(filters: ProductFilters = {}): Promise<PaginatedResponse<Product>> {
    const searchParams = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, String(value));
      }
    });

    return apiClient<PaginatedResponse<Product>>(`/products?${searchParams.toString()}`);
  },

  async getProduct(productId: string): Promise<Product> {
    return apiClient<Product>(`/products/${productId}`);
  },
};
