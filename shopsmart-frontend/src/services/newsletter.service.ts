import { apiClient } from '@/lib/api-client';

export interface NewsletterSubscribeResponse {
  message: string;
  email: string;
  subscribedAt: string;
}

export const newsletterService = {
  subscribe: async (email: string): Promise<NewsletterSubscribeResponse> => {
    return apiClient<NewsletterSubscribeResponse>('/newsletter/subscribe', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },
};
