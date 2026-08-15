import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { wishlistService } from '@/services/wishlist.service';
import { toast } from 'sonner';

export const wishlistKeys = {
  all: ['wishlist'] as const,
};

export function useWishlist() {
  return useQuery({
    queryKey: wishlistKeys.all,
    queryFn: () => wishlistService.getWishlist(),
    // Unauthenticated users will get a 401 which the apiClient handles,
    // but typically we disable fetching if no token is present.
    // However, the api-client will redirect to login or clear auth on 401, so this is fine.
  });
}

export function useAddToWishlist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) => wishlistService.addItem(productId),
    onSuccess: (data) => {
      queryClient.setQueryData(wishlistKeys.all, data);
      toast.success('Added to wishlist');
    },
    onError: (error: Error & { userMessage?: string }) => {
      toast.error(error.userMessage || 'Failed to add to wishlist');
    },
  });
}

export function useRemoveFromWishlist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) => wishlistService.removeItem(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: wishlistKeys.all });
      toast.success('Removed from wishlist');
    },
    onError: (error: Error & { userMessage?: string }) => {
      toast.error(error.userMessage || 'Failed to remove from wishlist');
    },
  });
}

export function useMoveToCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, productVariantId, quantity = 1 }: { productId: string; productVariantId: string; quantity?: number }) =>
      wishlistService.moveToCart(productId, productVariantId, quantity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: wishlistKeys.all });
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast.success('Moved to cart');
    },
    onError: (error: Error & { userMessage?: string }) => {
      toast.error(error.userMessage || 'Failed to move to cart');
    },
  });
}
