"use client";

import { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onChange?: (rating: number) => void;
  className?: string;
}

export function StarRating({
  rating,
  maxRating = 5,
  size = 'md',
  interactive = false,
  onChange,
  className,
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const sizeClasses = {
    sm: 'h-3.5 w-3.5',
    md: 'h-4 w-4',
    lg: 'h-6 w-6',
  };

  const currentRating = hoverRating !== null ? hoverRating : rating;

  return (
    <div
      className={cn('flex items-center gap-0.5', className)}
      role={interactive ? 'radiogroup' : 'img'}
      aria-label={`${rating} out of ${maxRating} stars`}
    >
      {Array.from({ length: maxRating }).map((_, index) => {
        const starValue = index + 1;
        const isFilled = starValue <= currentRating;

        if (interactive) {
          return (
            <button
              key={index}
              type="button"
              role="radio"
              aria-checked={starValue === rating}
              aria-label={`${starValue} star${starValue > 1 ? 's' : ''}`}
              className="p-1 -m-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm transition-transform hover:scale-110 active:scale-95"
              onClick={() => onChange?.(starValue)}
              onMouseEnter={() => setHoverRating(starValue)}
              onMouseLeave={() => setHoverRating(null)}
              onKeyDown={(e) => {
                if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
                  e.preventDefault();
                  onChange?.(Math.min(maxRating, starValue + 1));
                } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
                  e.preventDefault();
                  onChange?.(Math.max(1, starValue - 1));
                }
              }}
            >
              <Star
                className={cn(
                  sizeClasses[size],
                  'transition-colors',
                  isFilled
                    ? 'fill-amber-400 text-amber-400'
                    : 'fill-muted/40 text-muted-foreground/40 hover:text-amber-300'
                )}
              />
            </button>
          );
        }

        return (
          <Star
            key={index}
            className={cn(
              sizeClasses[size],
              isFilled
                ? 'fill-amber-400 text-amber-400'
                : 'fill-muted/30 text-muted-foreground/30'
            )}
          />
        );
      })}
    </div>
  );
}
