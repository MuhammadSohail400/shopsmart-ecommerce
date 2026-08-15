"use client";

import { useWishlist, useRemoveFromWishlist, useMoveToCart } from '@/features/wishlist/hooks/use-wishlist';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { Button, buttonVariants } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Heart, HeartCrack, Trash2, ShoppingBag } from 'lucide-react';
import Link from 'next/link';

function WishlistContent() {
  const { data: wishlist, isLoading, isError, refetch } = useWishlist();
  const remove = useRemoveFromWishlist();

  if (isLoading) {
    return (
      <div className="container py-8 max-w-6xl">
        <Skeleton className="h-10 w-48 mb-8" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="space-y-4">
              <Skeleton className="aspect-square w-full rounded-xl" />
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
        <HeartCrack className="h-16 w-16 text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold mb-2">Could not load wishlist</h1>
        <p className="text-muted-foreground mb-6">Something went wrong while fetching your wishlist.</p>
        <Button onClick={() => refetch()}>Try Again</Button>
      </div>
    );
  }

  // The backend wishlist repo returns { id, userId, items: [] }
  const items = wishlist?.items || [];
  const isEmpty = items.length === 0;

  if (isEmpty) {
    return (
      <div className="container py-20 text-center flex flex-col items-center">
        <Heart className="h-24 w-24 text-muted-foreground/30 mb-6" />
        <h1 className="text-3xl font-bold mb-4">Your wishlist is empty</h1>
        <p className="text-muted-foreground mb-8 text-lg">Keep track of items you love by adding them to your wishlist.</p>
        <Link href="/products" className={buttonVariants({ size: "lg" })}>
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
        <h1 className="text-3xl font-bold">My Wishlist</h1>
        <span className="text-muted-foreground">{items.length} {items.length === 1 ? 'item' : 'items'}</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {items.map((item) => (
          <div key={item.productId} className="group flex flex-col gap-3 rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden p-4 relative">
            <div className="aspect-square w-full rounded-md bg-muted overflow-hidden relative">
              {item.product.images && item.product.images.length > 0 ? (
                <img 
                  src={item.product.images[0].url} 
                  alt={item.product.title}
                  className="object-cover w-full h-full transition-transform group-hover:scale-105"
                />
              ) : (
                <div className="flex items-center justify-center w-full h-full text-muted-foreground/30">
                  <Heart className="h-8 w-8" />
                </div>
              )}
              
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 bg-background/50 hover:bg-background/80 hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.preventDefault();
                  remove.mutate(item.productId);
                }}
                disabled={remove.isPending}
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Remove from wishlist</span>
              </Button>
            </div>

            <div className="flex flex-col flex-1">
              <Link href={`/products/${item.product.slug}`} className="font-semibold text-base hover:underline line-clamp-1 mb-1">
                {item.product.title}
              </Link>
              <div className="font-bold text-primary mb-4">{formatPrice(item.product.basePrice)}</div>
              
              <div className="mt-auto">
                <Link 
                  href={`/products/${item.product.slug}`}
                  className={buttonVariants({ variant: "secondary", className: "w-full" })}
                >
                  <ShoppingBag className="mr-2 h-4 w-4" />
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
