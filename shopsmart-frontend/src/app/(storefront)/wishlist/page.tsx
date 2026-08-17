"use client";

import { useWishlist, useRemoveFromWishlist } from '@/features/wishlist/hooks/use-wishlist';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { Button, buttonVariants } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Heart, HeartCrack, Trash2, ShoppingBag, Loader2 } from 'lucide-react';
import Link from 'next/link';

function WishlistContent() {
  const { data: wishlist, isLoading, isError, refetch } = useWishlist();
  const remove = useRemoveFromWishlist();

  if (isLoading) {
    return (
      <div className="container py-8 max-w-6xl">
        <Skeleton className="h-10 w-48 mb-8" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="aspect-square w-full rounded-2xl" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/4" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container py-20 text-center flex flex-col items-center">
        <div className="p-4 rounded-full bg-destructive/10 text-destructive mb-4">
          <HeartCrack className="h-12 w-12" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Could not load your wishlist</h1>
        <p className="text-muted-foreground mb-6 text-sm max-w-md">
          Something went wrong while fetching your wishlist. Please try again.
        </p>
        <Button onClick={() => refetch()} className="rounded-full px-6">
          Try Again
        </Button>
      </div>
    );
  }

  const items = wishlist?.items || [];
  const isEmpty = items.length === 0;

  if (isEmpty) {
    return (
      <div className="container py-20 text-center flex flex-col items-center">
        <div className="p-6 rounded-full bg-secondary/40 text-muted-foreground/40 mb-6">
          <Heart className="h-16 w-16" />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight mb-3">Your wishlist is empty</h1>
        <p className="text-muted-foreground mb-8 text-base max-w-sm">
          Keep track of items you love by tapping the heart icon on any product card.
        </p>
        <Link href="/products" className={buttonVariants({ size: "lg", className: "rounded-full px-8 font-semibold shadow-md" })}>
          Discover Products
        </Link>
      </div>
    );
  }

  const formatPrice = (price: string | number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(price));
  };

  return (
    <div className="container py-8 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight">My Wishlist</h1>
        <span className="text-sm font-semibold text-muted-foreground bg-secondary/50 px-3 py-1 rounded-full">
          {items.length} {items.length === 1 ? 'item' : 'items'}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {items.map((item) => (
          <div
            key={item.productId}
            className="group flex flex-col rounded-2xl border border-border/50 bg-card text-card-foreground shadow-xs overflow-hidden relative transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
          >
            <div className="aspect-square w-full bg-secondary/30 flex items-center justify-center relative overflow-hidden">
              {item.product.images && item.product.images.length > 0 ? (
                <img 
                  src={item.product.images[0].url} 
                  alt={item.product.title}
                  loading="lazy"
                  className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="flex items-center justify-center w-full h-full text-muted-foreground/30">
                  <Heart className="h-10 w-10" />
                </div>
              )}
              
              <Button
                variant="ghost"
                size="icon"
                aria-label={`Remove ${item.product.title} from wishlist`}
                className="absolute top-2 right-2 bg-background/90 shadow-sm backdrop-blur-md h-8 w-8 rounded-full hover:bg-destructive hover:text-destructive-foreground transition-all"
                onClick={(e) => {
                  e.preventDefault();
                  remove.mutate(item.productId);
                }}
                disabled={remove.isPending}
              >
                {remove.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </Button>
            </div>

            <div className="flex flex-col flex-1 p-4">
              <Link href={`/products/${item.product.slug}`} className="font-bold text-sm hover:text-primary transition-colors line-clamp-2 mb-1.5">
                {item.product.title}
              </Link>
              <div className="font-extrabold text-base text-foreground mb-4">{formatPrice(item.product.basePrice)}</div>
              
              <div className="mt-auto">
                <Link 
                  href={`/products/${item.product.slug}`}
                  className={buttonVariants({ variant: "secondary", size: "sm", className: "w-full rounded-full font-semibold h-9" })}
                >
                  <ShoppingBag className="mr-1.5 h-3.5 w-3.5" />
                  Select Options
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function WishlistPage() {
  return (
    <ProtectedRoute>
      <WishlistContent />
    </ProtectedRoute>
  );
}
