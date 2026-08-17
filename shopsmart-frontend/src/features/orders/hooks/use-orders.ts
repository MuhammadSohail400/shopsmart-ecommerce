import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ordersService, OrderStatusFilter } from '@/services/orders.service';
import { useAuthStore } from '@/store/auth-store';

export const orderKeys = {
  all: ['orders'] as const,
  list: (filters?: { status?: OrderStatusFilter; cursor?: string; limit?: number }) =>
    [...orderKeys.all, 'list', filters] as const,
  detail: (id: string) => [...orderKeys.all, 'detail', id] as const,
};

export function useOrders(params?: {
  status?: OrderStatusFilter;
  cursor?: string;
  limit?: number;
}) {
  const accessToken = useAuthStore((state) => state.accessToken);
  const isServer = typeof window === 'undefined';
  const hasSession = !isServer && localStorage.getItem('has_session') === 'true';

  return useQuery({
    queryKey: orderKeys.list(params),
    queryFn: () => ordersService.list(params),
    enabled: !!accessToken || hasSession,
    staleTime: 30_000,
  });
}

export function useOrder(orderId: string | null | undefined) {
  const accessToken = useAuthStore((state) => state.accessToken);
  const isServer = typeof window === 'undefined';
  const hasSession = !isServer && localStorage.getItem('has_session') === 'true';

  return useQuery({
    queryKey: orderKeys.detail(orderId ?? ''),
    queryFn: () => ordersService.getById(orderId!),
    enabled: (!!accessToken || hasSession) && !!orderId,
    retry: false,
  });
}

export function useCancelOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, reason }: { orderId: string; reason?: string }) =>
      ordersService.cancel(orderId, reason),
    onSuccess: (_data, variables) => {
      // Invalidate the specific order and the list so status updates are reflected
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(variables.orderId) });
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
    },
  });
}
