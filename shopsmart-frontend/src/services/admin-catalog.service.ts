import { apiClient } from '@/lib/api-client';
import { Product, Category, Brand } from './products.service';

export interface CreateProductInput {
  title: string;
  slug?: string;
  description: string;
  basePrice: number;
  categoryId: string;
  brandId?: string | null;
  status?: 'draft' | 'pending_review' | 'approved' | 'rejected';
}

export interface UpdateProductInput {
  title?: string;
  slug?: string;
  description?: string;
  basePrice?: number;
  categoryId?: string;
  brandId?: string | null;
  status?: 'draft' | 'pending_review' | 'approved' | 'rejected';
}

export interface CreateVariantInput {
  sku: string;
  attributes: Record<string, string>;
  priceModifier?: number;
  inventory?: {
    quantity: number;
    reservedQuantity?: number;
    lowStockThreshold?: number;
  };
}

export interface UpdateVariantInput {
  sku?: string;
  attributes?: Record<string, string>;
  priceModifier?: number;
}

export interface AddImageInput {
  url: string;
  sortOrder?: number;
}

export interface CreateCategoryInput {
  name: string;
  slug: string;
  parentId?: string | null;
}

export interface UpdateCategoryInput {
  name?: string;
  slug?: string;
  parentId?: string | null;
}

export interface CreateBrandInput {
  name: string;
  slug: string;
}

export interface UpdateBrandInput {
  name?: string;
  slug?: string;
}

export const adminCatalogService = {
  // Products
  async createProduct(data: CreateProductInput): Promise<Product> {
    return apiClient<Product>('/products', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateProduct(id: string, data: UpdateProductInput): Promise<Product> {
    return apiClient<Product>(`/products/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  async deleteProduct(id: string): Promise<void> {
    return apiClient<void>(`/products/${id}`, {
      method: 'DELETE',
    });
  },

  // Variants
  async addVariant(productId: string, data: CreateVariantInput): Promise<any> {
    return apiClient(`/products/${productId}/variants`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateVariant(productId: string, variantId: string, data: UpdateVariantInput): Promise<any> {
    return apiClient(`/products/${productId}/variants/${variantId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  async deleteVariant(productId: string, variantId: string): Promise<void> {
    return apiClient<void>(`/products/${productId}/variants/${variantId}`, {
      method: 'DELETE',
    });
  },

  // Images
  async addImage(productId: string, data: AddImageInput): Promise<any> {
    return apiClient(`/products/${productId}/images`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async deleteImage(productId: string, imageId: string): Promise<void> {
    return apiClient<void>(`/products/${productId}/images/${imageId}`, {
      method: 'DELETE',
    });
  },

  async reorderImage(productId: string, imageId: string, sortOrder: number): Promise<any> {
    return apiClient(`/products/${productId}/images/${imageId}/reorder`, {
      method: 'PATCH',
      body: JSON.stringify({ sortOrder }),
    });
  },

  // Categories
  async createCategory(data: CreateCategoryInput): Promise<Category> {
    return apiClient<Category>('/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateCategory(id: string, data: UpdateCategoryInput): Promise<Category> {
    return apiClient<Category>(`/categories/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  async deleteCategory(id: string): Promise<void> {
    return apiClient<void>(`/categories/${id}`, {
      method: 'DELETE',
    });
  },

  // Brands
  async createBrand(data: CreateBrandInput): Promise<Brand> {
    return apiClient<Brand>('/brands', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateBrand(id: string, data: UpdateBrandInput): Promise<Brand> {
    return apiClient<Brand>(`/brands/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  async deleteBrand(id: string): Promise<void> {
    return apiClient<void>(`/brands/${id}`, {
      method: 'DELETE',
    });
  },
};
