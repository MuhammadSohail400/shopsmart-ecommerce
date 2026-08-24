import { reviewsRepository } from './reviews.repository';
import { hasDeliveredOrderForProduct } from '@modules/orders';
import { getProductById } from '@modules/products';
import { AuthorizationError, ConflictError, NotFoundError } from '@shared/errors';
import type { CreateReviewBody } from './reviews.validators';

export const reviewsService = {
  async listForProduct(productId: string, cursor: string | undefined, limit: number) {
    const [{ items, hasMore }, rating] = await Promise.all([
      reviewsRepository.listForProduct(productId, cursor, limit),
      reviewsRepository.getAverageRating(productId),
    ]);
    return {
      items,
      nextCursor: hasMore ? items[items.length - 1]?.id ?? null : null,
      hasMore,
      averageRating: Math.round(rating.average * 10) / 10,
      reviewCount: rating.count,
    };
  },

  // BR-006: only customers with a delivered order containing this product may review
  async create(userId: string, productId: string, data: CreateReviewBody) {
    await getProductById(productId); // throws NotFoundError if it doesn't exist/isn't approved

    const qualifyingOrder = await hasDeliveredOrderForProduct(userId, productId);
    if (!qualifyingOrder) {
      throw new AuthorizationError(
        'You can only review products from orders that have been delivered to you',
      );
    }

    const existing = await reviewsRepository.findExisting(qualifyingOrder.orderId, productId, userId);
    if (existing) {
      throw new ConflictError('REVIEW_ALREADY_EXISTS', 'You have already reviewed this product for this order');
    }

    return reviewsRepository.create({
      orderId: qualifyingOrder.orderId,
      productId,
      userId,
      rating: data.rating,
      comment: data.comment,
    });
  },

  async moderate(reviewId: string) {
    const review = await reviewsRepository.findById(reviewId);
    if (!review) throw new NotFoundError('Review');
    await reviewsRepository.hide(reviewId);
  },

  async adminList(params: {
    page?: number;
    limit?: number;
    status?: 'all' | 'published' | 'hidden';
    rating?: number;
    search?: string;
  }) {
    return reviewsRepository.listAllForAdmin(params);
  },

  async adminUpdateStatus(reviewId: string, hidden: boolean) {
    const review = await reviewsRepository.findById(reviewId);
    if (!review) throw new NotFoundError('Review');
    return reviewsRepository.updateStatus(reviewId, hidden);
  },

  async adminGetStats() {
    return reviewsRepository.getModerationStats();
  },

  async adminDelete(reviewId: string) {
    const review = await reviewsRepository.findById(reviewId);
    if (!review) throw new NotFoundError('Review');
    return reviewsRepository.deleteReview(reviewId);
  },
};

