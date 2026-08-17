import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cartService } from '@/services/cart.service';
import { useCartStore } from '@/store/cart-store';
import { useAuthStore } from '@/store/auth-store';
import { toast } from 'sonner';

export const cartKeys = {
  all: ['cart'] as const,
};

export function useCart() {
  const { initializeGuestCart } = useCartStore();
  const accessToken = useAuthStore((state) => state.accessToken);
  const isServer = typeof window === 'undefined';
  const hasSession = !isServer && localStorage.getItem('has_session') === 'true';

  return useQuery({
    queryKey: cartKeys.all,
    queryFn: () => {
      initializeGuestCart();
      return cartService.getCart();
    },
    enabled: !!accessToken || hasSession,
  });
}

export function useAddToCart() {
  const queryClient = useQueryClient();
  const { initializeGuestCart } = useCartStore();

  return useMutation({
    mutationFn: async ({ productVariantId, quantity }: { productVariantId: string; quantity: number }) => {
      initializeGuestCart();
      return cartService.addItem(productVariantId, quantity);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(cartKeys.all, data);
      toast.success('Added to cart');
    },
    onError: (error: Error & { userMessage?: string }) => {
      toast.error(error.userMessage || 'Failed to add item to cart');
    },
  });
}

export function useUpdateCartItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) => {
      return cartService.updateItem(itemId, quantity);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(cartKeys.all, data);
    },
    onError: (error: Error & { userMessage?: string }) => {
      toast.error(error.userMessage || 'Failed to update quantity');
      // Refetch to ensure client is in sync with server state
      queryClient.invalidateQueries({ queryKey: cartKeys.all });
    },
  });
}

export function useRemoveCartItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (itemId: string) => {
      return cartService.removeItem(itemId);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(cartKeys.all, data);
      toast.success('Item removed');
    },
    onError: (error: Error & { userMessage?: string }) => {
      toast.error(error.userMessage || 'Failed to remove item');
      queryClient.invalidateQueries({ queryKey: cartKeys.all });
    },
  });
}

export function useClearCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => cartService.clearCart(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cartKeys.all });
    },
    onError: (error: Error & { userMessage?: string }) => {
      toast.error(error.userMessage || 'Failed to clear cart');
    },
  });
}
