"use client";

import { useProductReviews } from '../hooks/use-reviews';
import { RatingSummary } from './rating-summary';
import { ReviewCard } from './review-card';
import { WriteReviewDialog } from './write-review-dialog';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { RefreshCw, Sparkles } from 'lucide-react';

interface ProductReviewsSectionProps {
  productId: string;
  productTitle?: string;
}

export function ProductReviewsSection({ productId, productTitle }: ProductReviewsSectionProps) {
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useProductReviews(productId, 10);

  // Flatten all review pages
  const allReviews = data?.pages.flatMap((page) => page?.data || []) || [];
  const latestSummary = data?.pages[0]?.ratingSummary || { averageRating: 0, reviewCount: 0 };

  return (
    <section className="mt-16 pt-12 border-t border-border/60" id="reviews">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
              Customer Reviews
            </h2>
            <span className="bg-primary/10 text-primary text-xs font-bold px-2.5 py-0.5 rounded-full">
              {latestSummary.reviewCount}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Real feedback from verified purchasers of this item.
          </p>
        </div>

        {/* Action Button */}
        <div>
          <WriteReviewDialog productId={productId} productTitle={productTitle} />
        </div>
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="space-y-6">
          <Skeleton className="h-44 w-full rounded-2xl" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-32 w-full rounded-2xl" />
            <Skeleton className="h-32 w-full rounded-2xl" />
          </div>
        </div>
      )}

      {/* Error State */}
      {isError && (
        <div className="bg-destructive/5 border border-destructive/20 rounded-2xl p-8 text-center space-y-3">
          <p className="font-semibold text-destructive">Unable to load customer reviews</p>
          <p className="text-xs text-muted-foreground">
            {error instanceof Error ? error.message : 'An unexpected error occurred.'}
          </p>
          <Button variant="outline" size="sm" onClick={() => refetch()} className="rounded-full gap-2">
            <RefreshCw className="h-3.5 w-3.5" />
            Try Again
          </Button>
        </div>
      )}

      {/* Content */}
      {!isLoading && !isError && (
        <div className="space-y-8">
          {/* Rating Summary Breakdown */}
          {latestSummary.reviewCount > 0 && (
            <RatingSummary summary={latestSummary} reviews={allReviews} />
          )}

          {/* Empty State */}
          {allReviews.length === 0 ? (
            <div className="bg-card border border-border/60 rounded-2xl p-12 text-center flex flex-col items-center justify-center">
              <div className="h-16 w-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
                <Sparkles className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-bold text-foreground">No reviews yet</h3>
              <p className="text-sm text-muted-foreground max-w-sm mt-1 mb-6">
                Be the first verified customer to share your thoughts on this product.
              </p>
              <WriteReviewDialog productId={productId} productTitle={productTitle} />
            </div>
          ) : (
            /* Reviews Grid/List */
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {allReviews.map((review) => (
                  <ReviewCard key={review.id} review={review} />
                ))}
              </div>

              {/* Load More Button */}
              {hasNextPage && (
                <div className="flex justify-center pt-4">
                  <Button
                    variant="outline"
                    className="rounded-full px-8 font-semibold shadow-sm hover:border-primary/50"
                    onClick={() => fetchNextPage()}
                    disabled={isFetchingNextPage}
                  >
                    {isFetchingNextPage ? (
                      <span className="flex items-center gap-2">
                        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        Loading more...
                      </span>
                    ) : (
                      'Load More Reviews'
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
