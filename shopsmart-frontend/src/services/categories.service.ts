import { apiClient } from '@/lib/api-client';
import { Category } from './products.service';

export const categoriesService = {
  async getCategories(): Promise<Category[]> {
    return apiClient<Category[]>('/categories');
  },
  
  async getCategory(categoryId: string): Promise<Category> {
    return apiClient<Category>(`/categories/${categoryId}`);
  }
};
