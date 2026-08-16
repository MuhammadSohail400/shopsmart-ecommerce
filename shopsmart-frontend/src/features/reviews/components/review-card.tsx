"use client";

import { CheckCircle2, User } from 'lucide-react';
import { StarRating } from './star-rating';
import { Review } from '@/types/reviews.types';

interface ReviewCardProps {
  review: Review;
}

function maskEmail(email?: string | null): string {
  if (!email) return 'Verified Customer';
  const parts = email.split('@');
  if (parts.length < 2) return email;
  const username = parts[0];
  const domain = parts[1];
  const maskedUser = username.length > 2 ? `${username.slice(0, 2)}***` : `${username[0]}***`;
  return `${maskedUser}@${domain}`;
}

export function ReviewCard({ review }: ReviewCardProps) {
  const reviewerName = review.user?.email ? maskEmail(review.user.email) : 'Verified Buyer';
  const dateFormatted = new Date(review.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="bg-card border border-border/60 rounded-2xl p-5 shadow-sm transition-all hover:border-border">
      {/* Header: User + Rating + Date */}
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
            {review.user?.email ? review.user.email.slice(0, 2).toUpperCase() : <User className="h-4 w-4" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-foreground">{reviewerName}</span>
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40 px-2 py-0.5 rounded-full">
                <CheckCircle2 className="h-3 w-3" />
                Verified Purchase
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <StarRating rating={review.rating} size="sm" />
              <span className="text-xs text-muted-foreground">·</span>
              <span className="text-xs text-muted-foreground font-mono">{dateFormatted}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Review Comment */}
      {review.comment ? (
        <p className="text-sm text-foreground/90 leading-relaxed break-words whitespace-pre-line mt-2">
          {review.comment}
        </p>
      ) : (
        <p className="text-xs text-muted-foreground italic mt-2">No written comment provided.</p>
      )}
    </div>
  );
}
