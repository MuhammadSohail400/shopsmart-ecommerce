import { apiClient } from '@/lib/api-client';

export interface Banner {
  id: string;
  imageUrl: string;
  linkUrl?: string | null;
  startDate: string;
  endDate: string;
  sortOrder: number;
}

export const cmsService = {
  async getBanners(): Promise<Banner[]> {
    return apiClient<Banner[]>('/cms/banners');
  }
};
