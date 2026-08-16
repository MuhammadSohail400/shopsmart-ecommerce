"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCurrentUser } from '@/hooks/use-auth';
import { useCreateReview } from '../hooks/use-reviews';
import { StarRating } from './star-rating';
import { Button, buttonVariants } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { AlertCircle, Lock, PenLine, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { ApiError } from '@/lib/api-client';

const reviewSchema = z.object({
  rating: z.number().int().min(1, 'Please select a rating between 1 and 5 stars').max(5),
  comment: z.string().max(2000, 'Comment must be 2000 characters or fewer').optional(),
});

type ReviewFormData = z.infer<typeof reviewSchema>;

interface WriteReviewDialogProps {
  productId: string;
  productTitle?: string;
}

export function WriteReviewDialog({ productId, productTitle }: WriteReviewDialogProps) {
  const [open, setOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { data: user } = useCurrentUser();
  const createReviewMutation = useCreateReview(productId);

  const {
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: 5,
      comment: '',
    },
  });

  const currentRating = watch('rating');
  const commentText = watch('comment') || '';

  const onSubmit = (data: ReviewFormData) => {
    setErrorMessage(null);
    createReviewMutation.mutate(
      {
        rating: data.rating,
        comment: data.comment?.trim() ? data.comment.trim() : undefined,
      },
      {
        onSuccess: () => {
          toast.success('Thank you! Your review has been submitted.');
          reset();
          setOpen(false);
        },
        onError: (err) => {
          if (err instanceof ApiError) {
            setErrorMessage(err.userMessage || 'Failed to submit review');
          } else {
            setErrorMessage(err.message || 'Failed to submit review');
          }
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button className="rounded-full shadow-sm font-semibold gap-2">
            <PenLine className="h-4 w-4" />
            Write a Review
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Write a Review
          </DialogTitle>
          {productTitle && (
            <DialogDescription className="line-clamp-1 text-xs">
              Reviewing: {productTitle}
            </DialogDescription>
          )}
        </DialogHeader>

        {!user ? (
          <div className="py-6 text-center space-y-4">
            <div className="bg-muted/50 p-4 rounded-2xl w-14 h-14 mx-auto flex items-center justify-center">
              <Lock className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <p className="font-semibold text-base">Sign in to write a review</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
                You must be logged in with a delivered order for this product to share your feedback.
              </p>
            </div>
            <Link
              href="/login"
              className={buttonVariants({ className: 'rounded-full w-full max-w-xs font-semibold' })}
              onClick={() => setOpen(false)}
            >
              Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
            {errorMessage && (
              <Alert variant="destructive" className="py-2.5">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle className="text-xs font-bold">Eligibility Notice</AlertTitle>
                <AlertDescription className="text-xs">{errorMessage}</AlertDescription>
              </Alert>
            )}

            {/* Rating Picker */}
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Your Rating *
              </Label>
              <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl border border-border/40">
                <StarRating
                  rating={currentRating}
                  size="lg"
                  interactive
                  onChange={(r) => setValue('rating', r, { shouldValidate: true })}
                />
                <span className="text-sm font-semibold text-foreground">
                  {currentRating === 5 && '5.0 - Excellent'}
                  {currentRating === 4 && '4.0 - Very Good'}
                  {currentRating === 3 && '3.0 - Average'}
                  {currentRating === 2 && '2.0 - Poor'}
                  {currentRating === 1 && '1.0 - Terrible'}
                </span>
              </div>
              {errors.rating && (
                <p className="text-xs text-destructive">{errors.rating.message}</p>
              )}
            </div>

            {/* Comment Area */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="comment" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Your Review (Optional)
                </Label>
                <span className="text-[11px] text-muted-foreground font-mono">
                  {commentText.length}/2000
                </span>
              </div>
              <Textarea
                id="comment"
                placeholder="What did you like or dislike about this product? How did it fit your expectations?"
                className="min-h-[120px] rounded-xl resize-none text-sm"
                maxLength={2000}
                onChange={(e) => setValue('comment', e.target.value)}
              />
              {errors.comment && (
                <p className="text-xs text-destructive">{errors.comment.message}</p>
              )}
            </div>

            {/* Notice about verified purchase */}
            <div className="bg-primary/5 border border-primary/10 rounded-xl p-3 text-[11px] text-muted-foreground leading-relaxed">
              💡 <strong>Verified Purchase Policy:</strong> Reviews are accepted only from accounts with a confirmed delivery of this product.
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                className="rounded-full"
                onClick={() => setOpen(false)}
                disabled={createReviewMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="rounded-full font-semibold px-6 shadow-md"
                disabled={createReviewMutation.isPending}
              >
                {createReviewMutation.isPending ? 'Submitting...' : 'Submit Review'}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
