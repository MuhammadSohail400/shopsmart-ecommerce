import { apiClient } from '@/lib/api-client';
import {
  CheckoutSession,
  CreateSessionPayload,
  ConfirmSessionPayload,
  ConfirmCheckoutResult,
} from '@/types/checkout.types';

export const checkoutService = {
  /**
   * Step 1: Creates a checkout session from the cart.
   * Returns pricing totals (shipping, tax, discount) calculated server-side.
   * The returned `sessionId` must be used in `confirmSession`.
   */
  createSession: async (data: CreateSessionPayload): Promise<CheckoutSession> => {
    return apiClient<CheckoutSession>('/checkout/sessions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getSession: async (sessionId: string): Promise<CheckoutSession> => {
    return apiClient<CheckoutSession>(`/checkout/sessions/${sessionId}`);
  },

  /**
   * Step 2: Confirms the session, creates the Order, and initiates payment.
   * For `card` payments, the response `payment.clientSecret` must be used to
   * initialize Stripe Elements — do NOT use this to mark the order as paid.
   * For `cod`/`bank_transfer`, the order is confirmed immediately.
   *
   * IMPORTANT: The `idempotencyKey` must remain stable across retries of the
   * same attempt. Generate it once per submission, store it in component state,
   * and only generate a new one when the user explicitly starts a new attempt.
   */
  confirmSession: async (
    sessionId: string,
    data: ConfirmSessionPayload,
    idempotencyKey: string
  ): Promise<ConfirmCheckoutResult> => {
    return apiClient<ConfirmCheckoutResult>(`/checkout/sessions/${sessionId}/confirm`, {
      method: 'POST',
      headers: {
        'Idempotency-Key': idempotencyKey,
      },
      body: JSON.stringify(data),
    });
  },
};
