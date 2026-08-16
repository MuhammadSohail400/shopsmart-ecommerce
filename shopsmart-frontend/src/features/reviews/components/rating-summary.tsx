"use client";

import { StarRating } from './star-rating';
import { RatingSummary as RatingSummaryType, Review } from '@/types/reviews.types';

interface RatingSummaryProps {
  summary: RatingSummaryType;
  reviews?: Review[];
}

export function RatingSummary({ summary, reviews = [] }: RatingSummaryProps) {
  const { averageRating, reviewCount } = summary;

  // Calculate actual distribution from loaded reviews (or empty if none)
  const distribution: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach((r) => {
    if (r.rating >= 1 && r.rating <= 5) {
      distribution[r.rating] = (distribution[r.rating] || 0) + 1;
    }
  });

  const totalCalculated = reviews.length > 0 ? reviews.length : 1;

  return (
    <div className="bg-card border border-border/60 rounded-2xl p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row items-center gap-6">
        {/* Main score box */}
        <div className="flex flex-col items-center justify-center sm:border-r sm:border-border/60 sm:pr-8 text-center min-w-[140px]">
          <div className="text-4xl sm:text-5xl font-black text-foreground tracking-tight">
            {reviewCount > 0 ? averageRating.toFixed(1) : '0.0'}
          </div>
          <div className="mt-2 mb-1">
            <StarRating rating={Math.round(averageRating)} size="md" />
          </div>
          <p className="text-xs text-muted-foreground font-medium">
            Based on {reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}
          </p>
        </div>

        {/* Breakdown bars */}
        <div className="flex-1 w-full space-y-2">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = distribution[star] || 0;
            const percentage = reviews.length > 0 ? Math.round((count / totalCalculated) * 100) : 0;

            return (
              <div key={star} className="flex items-center gap-3 text-xs">
                <span className="w-7 text-muted-foreground font-medium flex items-center justify-end gap-1">
                  {star} <span className="text-amber-400">★</span>
                </span>
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="w-8 text-right text-muted-foreground font-mono">
                  {reviews.length > 0 ? `${percentage}%` : '0%'}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
