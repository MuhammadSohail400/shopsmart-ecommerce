import { apiClient } from '@/lib/api-client';
import { 
  CheckoutSession, 
  CreateSessionPayload, 
  ConfirmSessionPayload, 
  CheckoutConfirmationResult 
} from '@/types/checkout.types';

export const checkoutService = {
  createSession: async (data: CreateSessionPayload): Promise<CheckoutSession> => {
    return apiClient<CheckoutSession>('/checkout/sessions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getSession: async (sessionId: string): Promise<CheckoutSession> => {
    return apiClient<CheckoutSession>(`/checkout/sessions/${sessionId}`);
  },

  confirmSession: async (
    sessionId: string, 
    data: ConfirmSessionPayload, 
    idempotencyKey: string
  ): Promise<CheckoutConfirmationResult> => {
    return apiClient<CheckoutConfirmationResult>(`/checkout/sessions/${sessionId}/confirm`, {
      method: 'POST',
      headers: {
        'Idempotency-Key': idempotencyKey,
      },
      body: JSON.stringify(data),
    });
  },
};
