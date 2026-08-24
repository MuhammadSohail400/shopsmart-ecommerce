"use client";

import { useWishlist, useRemoveFromWishlist } from '@/features/wishlist/hooks/use-wishlist';
import { Button, buttonVariants } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Heart, HeartCrack, Trash2, ShoppingBag, Loader2, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { formatCurrency, getDiscountDetails } from '@/lib/utils';

function WishlistContent() {
  const { data: wishlist, isLoading, isError, refetch } = useWishlist();
  const remove = useRemoveFromWishlist();

  if (isLoading) {
    return (
      <div className="container max-w-6xl mx-auto py-8 px-4 sm:px-6">
        <Skeleton className="h-9 w-48 mb-8 rounded-xl" />
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-[4/5] w-full rounded-2xl" />
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/3" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container max-w-md mx-auto py-20 text-center flex flex-col items-center px-4">
        <div className="p-4 rounded-full bg-destructive/10 text-destructive mb-4">
          <HeartCrack className="h-10 w-10" />
        </div>
        <h1 className="text-xl font-bold mb-2">Could not load your wishlist</h1>
        <p className="text-muted-foreground mb-6 text-xs leading-relaxed max-w-md">
          Something went wrong while fetching your saved items. Please check your connection and try again.
        </p>
        <Button onClick={() => refetch()} className="rounded-full px-6 text-xs font-bold h-10">
          Try Again
        </Button>
      </div>
    );
  }

  const items = wishlist?.items || [];
  const isEmpty = items.length === 0;

  if (isEmpty) {
    return (
      <div className="container max-w-md mx-auto py-20 text-center flex flex-col items-center px-4">
        <div className="p-6 rounded-full bg-secondary/40 text-muted-foreground/40 mb-6">
          <Heart className="h-14 w-14" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight mb-2">Your wishlist is empty</h1>
        <p className="text-muted-foreground mb-8 text-xs sm:text-sm leading-relaxed max-w-sm">
          Keep track of fashion items you love by tapping the heart icon on any product card.
        </p>
        <Link href="/products" className={buttonVariants({ size: "lg", className: "rounded-full px-8 font-bold shadow-md text-xs sm:text-sm h-11" })}>
          Explore Collection
        </Link>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto py-6 sm:py-8 px-4 sm:px-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">Saved Items</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Your personal fashion wishlist</p>
        </div>
        <span className="text-xs font-bold text-muted-foreground bg-secondary/80 px-3 py-1 rounded-full">
          {items.length} {items.length === 1 ? 'item' : 'items'}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
        {items.map((item) => {
          const discount = getDiscountDetails(item.product.basePrice, item.product.slug);
          return (
            <div
              key={item.productId}
              className="group flex flex-col rounded-2xl border border-border/50 bg-card text-card-foreground shadow-2xs overflow-hidden relative transition-all duration-300 hover:shadow-lg hover:border-primary/40"
            >
              <div className="aspect-[4/5] w-full bg-secondary/30 flex items-center justify-center relative overflow-hidden">
                <Link href={`/products/${item.product.slug}`} className="absolute inset-0 z-0">
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
                </Link>

                {discount.isSale && (
                  <Badge className="absolute top-2.5 left-2.5 z-10 bg-rose-600 text-white font-black text-[10px] px-2 py-0.5 rounded-md border-none pointer-events-none">
                    -{discount.discountPercent}%
                  </Badge>
                )}
                
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Remove ${item.product.title} from wishlist`}
                  className="absolute top-2.5 right-2.5 z-10 bg-background/90 shadow-2xs backdrop-blur-md h-8 w-8 rounded-full hover:bg-destructive hover:text-destructive-foreground transition-all"
                  onClick={(e) => {
                    e.preventDefault();
                    remove.mutate(item.productId);
                  }}
                  disabled={remove.isPending}
                >
                  {remove.isPending ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="h-3.5 w-3.5" />
                  )}
                </Button>
              </div>

              <div className="flex flex-col flex-1 p-3 sm:p-3.5">
                <Link href={`/products/${item.product.slug}`} className="font-bold text-xs sm:text-sm hover:text-primary transition-colors line-clamp-2 mb-1 text-foreground leading-snug">
                  {item.product.title}
                </Link>
                
                <div className="flex items-baseline gap-2 mb-3">
                  <span className="font-extrabold text-sm sm:text-base text-foreground">
                    {discount.formattedCurrent}
                  </span>
                  {discount.isSale && (
                    <span className="text-[11px] text-muted-foreground line-through font-semibold">
                      {discount.formattedOriginal}
                    </span>
                  )}
                </div>
                
                <div className="mt-auto pt-2 border-t border-border/30">
                  <Link 
                    href={`/products/${item.product.slug}`}
                    className={buttonVariants({ variant: "secondary", size: "sm", className: "w-full rounded-full font-bold h-8 text-xs gap-1 hover:bg-primary hover:text-primary-foreground transition-colors" })}
                  >
                    <ShoppingBag className="h-3.5 w-3.5" />
                    Select Options
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function WishlistPage() {
  return <WishlistContent />;
}
