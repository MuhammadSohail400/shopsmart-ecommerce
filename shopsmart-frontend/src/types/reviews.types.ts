export interface ReviewUser {
  id: string;
  email: string | null;
}

export interface Review {
  id: string;
  orderId: string;
  productId: string;
  userId: string;
  rating: number;
  comment?: string | null;
  createdAt: string;
  user?: ReviewUser | null;
}

export interface RatingSummary {
  averageRating: number;
  reviewCount: number;
}

export interface ReviewsPagination {
  nextCursor: string | null;
  hasMore: boolean;
  limit: number;
}

export interface ProductReviewsResponse {
  success: boolean;
  data: Review[];
  pagination: ReviewsPagination;
  ratingSummary: RatingSummary;
}

export interface CreateReviewPayload {
  rating: number;
  comment?: string;
}
