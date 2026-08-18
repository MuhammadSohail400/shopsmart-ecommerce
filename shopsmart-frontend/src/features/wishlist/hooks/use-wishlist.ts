import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { wishlistService } from '@/services/wishlist.service';
import { useAuthStore } from '@/store/auth-store';
import { toast } from 'sonner';

export const wishlistKeys = {
  all: ['wishlist'] as const,
};

export function useWishlist() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const isServer = typeof window === 'undefined';
  const hasSession = !isServer && localStorage.getItem('has_session') === 'true';

  return useQuery({
    queryKey: wishlistKeys.all,
    queryFn: () => wishlistService.getWishlist(),
    enabled: !!accessToken || hasSession,
    staleTime: 60 * 1000,
  });
}

export function useAddToWishlist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) => wishlistService.addItem(productId),
    onMutate: async (productId: string) => {
      await queryClient.cancelQueries({ queryKey: wishlistKeys.all });
      const previousWishlist = queryClient.getQueryData(wishlistKeys.all);

      queryClient.setQueryData(wishlistKeys.all, (old: any) => {
        const currentItems = old?.items || [];
        if (currentItems.some((item: any) => item.productId === productId)) return old;
        return {
          ...old,
          items: [...currentItems, { productId, id: `temp-${Date.now()}` }],
        };
      });

      return { previousWishlist };
    },
    onSuccess: (data) => {
      if (data) {
        queryClient.setQueryData(wishlistKeys.all, data);
      }
      toast.success('Added to wishlist');
    },
    onError: (error: Error & { userMessage?: string }, _, context) => {
      if (context?.previousWishlist) {
        queryClient.setQueryData(wishlistKeys.all, context.previousWishlist);
      }
      toast.error(error.userMessage || 'Failed to add to wishlist');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: wishlistKeys.all });
    },
  });
}

export function useRemoveFromWishlist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) => wishlistService.removeItem(productId),
    onMutate: async (productId: string) => {
      await queryClient.cancelQueries({ queryKey: wishlistKeys.all });
      const previousWishlist = queryClient.getQueryData(wishlistKeys.all);

      queryClient.setQueryData(wishlistKeys.all, (old: any) => {
        if (!old) return old;
        return {
          ...old,
          items: old.items?.filter((item: any) => item.productId !== productId) || [],
        };
      });

      return { previousWishlist };
    },
    onSuccess: () => {
      toast.success('Removed from wishlist');
    },
    onError: (error: Error & { userMessage?: string }, _, context) => {
      if (context?.previousWishlist) {
        queryClient.setQueryData(wishlistKeys.all, context.previousWishlist);
      }
      toast.error(error.userMessage || 'Failed to remove from wishlist');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: wishlistKeys.all });
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
