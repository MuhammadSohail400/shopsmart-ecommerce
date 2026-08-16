import { apiClient } from '@/lib/api-client';

export interface CreateContactMessagePayload {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface ContactMessageResponse {
  message: string;
  id: string;
  createdAt: string;
}

export const contactService = {
  submitMessage: async (data: CreateContactMessagePayload): Promise<ContactMessageResponse> => {
    return apiClient<ContactMessageResponse>('/contact', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};
