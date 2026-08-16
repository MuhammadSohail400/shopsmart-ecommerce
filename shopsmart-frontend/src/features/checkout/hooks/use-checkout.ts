import { useMutation, useQuery } from '@tanstack/react-query';
import { checkoutService } from '@/services/checkout.service';
import { CreateSessionPayload, ConfirmSessionPayload } from '@/types/checkout.types';

export const checkoutKeys = {
  all: ['checkout'] as const,
  session: (id: string) => [...checkoutKeys.all, 'session', id] as const,
};

export function useCreateCheckoutSession() {
  return useMutation({
    mutationFn: (data: CreateSessionPayload) => checkoutService.createSession(data),
  });
}

export function useCheckoutSession(sessionId: string | null) {
  return useQuery({
    queryKey: checkoutKeys.session(sessionId!),
    queryFn: () => checkoutService.getSession(sessionId!),
    enabled: !!sessionId,
    retry: false,
  });
}

export function useConfirmCheckoutSession() {
  return useMutation({
    mutationFn: ({
      sessionId,
      data,
      idempotencyKey,
    }: {
      sessionId: string;
      data: ConfirmSessionPayload;
      idempotencyKey: string;
    }) => checkoutService.confirmSession(sessionId, data, idempotencyKey),
  });
}
