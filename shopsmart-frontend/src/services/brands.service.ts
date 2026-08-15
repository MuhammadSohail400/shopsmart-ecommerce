import { apiClient } from '@/lib/api-client';
import { Brand } from './products.service';

export const brandsService = {
  async getBrands(): Promise<Brand[]> {
    return apiClient<Brand[]>('/brands');
  },
  
  async getBrand(brandId: string): Promise<Brand> {
    return apiClient<Brand>(`/brands/${brandId}`);
  }
};
