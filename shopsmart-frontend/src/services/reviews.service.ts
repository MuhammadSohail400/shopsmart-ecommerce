import { apiClient } from '@/lib/api-client';
import { ProductReviewsResponse, Review, CreateReviewPayload } from '@/types/reviews.types';

export const reviewsService = {
  /**
   * GET /api/v1/products/:productId/reviews (public)
   */
  getProductReviews: async (
    productId: string,
    params?: { cursor?: string; limit?: number }
  ): Promise<ProductReviewsResponse> => {
    const qs = new URLSearchParams();
    if (params?.cursor) qs.set('cursor', params.cursor);
    if (params?.limit) qs.set('limit', String(params.limit));
    const queryString = qs.toString();
    return apiClient<ProductReviewsResponse>(
      `/products/${productId}/reviews${queryString ? `?${queryString}` : ''}`
    );
  },

  /**
   * POST /api/v1/products/:productId/reviews (auth required, requires delivered order)
   */
  createReview: async (
    productId: string,
    data: CreateReviewPayload
  ): Promise<Review> => {
    return apiClient<Review>(`/products/${productId}/reviews`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};
