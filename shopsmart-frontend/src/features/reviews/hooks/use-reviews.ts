import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { reviewsService } from '@/services/reviews.service';
import { CreateReviewPayload } from '@/types/reviews.types';

export const reviewKeys = {
  all: ['reviews'] as const,
  product: (productId: string) => [...reviewKeys.all, 'product', productId] as const,
  productInfinite: (productId: string) => [...reviewKeys.all, 'product-infinite', productId] as const,
};

export function useProductReviews(productId: string, limit = 10) {
  return useInfiniteQuery({
    queryKey: reviewKeys.productInfinite(productId),
    queryFn: ({ pageParam }) =>
      reviewsService.getProductReviews(productId, {
        cursor: pageParam || undefined,
        limit,
      }),
    initialPageParam: '',
    getNextPageParam: (lastPage) => lastPage?.pagination?.nextCursor ?? undefined,
    enabled: !!productId,
    staleTime: 30_000,
  });
}

export function useProductReviewSummary(productId: string) {
  return useQuery({
    queryKey: reviewKeys.product(productId),
    queryFn: () => reviewsService.getProductReviews(productId, { limit: 1 }),
    select: (data) => data.ratingSummary,
    enabled: !!productId,
    staleTime: 60_000,
  });
}

export function useCreateReview(productId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateReviewPayload) => reviewsService.createReview(productId, data),
    onSuccess: () => {
      // Invalidate review queries for this product so new review & updated summary appear
      queryClient.invalidateQueries({ queryKey: reviewKeys.product(productId) });
      queryClient.invalidateQueries({ queryKey: reviewKeys.productInfinite(productId) });
      queryClient.invalidateQueries({ queryKey: ['products', 'detail', productId] });
    },
  });
}
