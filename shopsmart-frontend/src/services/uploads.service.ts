import { apiClient } from '@/lib/api-client';

export interface UploadResult {
  url: string;
  filename: string;
  size: number;
  mimeType: string;
}

export const uploadsService = {
  uploadCustomDesign: async (imageBase64: string): Promise<UploadResult> => {
    return apiClient<UploadResult>('/uploads/custom-design', {
      method: 'POST',
      body: JSON.stringify({ image: imageBase64 }),
    });
  },
};
