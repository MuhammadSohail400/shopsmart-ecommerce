"use client";

import { useCart, useUpdateCartItem, useRemoveCartItem, useClearCart } from '@/features/cart/hooks/use-cart';
import { Button, buttonVariants } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { ShoppingCart, Trash2, Plus, Minus, PackageX, Loader2, ArrowRight, Truck, ShieldCheck, Lock } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/protected-route';

function CartContent() {
  const router = useRouter();
  const { data: cart, isLoading, isError, refetch } = useCart();
  const updateQuantity = useUpdateCartItem();
  const removeItem = useRemoveCartItem();
  const clearCart = useClearCart();

  if (isLoading) {
    return (
      <div className="container max-w-6xl mx-auto py-8 px-4">
        <Skeleton className="h-10 w-48 mb-8 rounded-xl" />
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="flex gap-4 p-4 rounded-2xl border border-border/40">
              <Skeleton className="h-24 w-24 rounded-xl" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-6 w-3/4 rounded-md" />
                <Skeleton className="h-4 w-1/4 rounded-md" />
              </div>
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
          <PackageX className="h-10 w-10" />
        </div>
        <h1 className="text-xl font-bold mb-2">Could not load your cart</h1>
        <p className="text-muted-foreground mb-6 text-xs leading-relaxed">
          Something went wrong while fetching your cart details. Please check your connection and try again.
        </p>
        <Button onClick={() => refetch()} className="rounded-full px-6 text-xs h-10 font-bold">
          Try Again
        </Button>
      </div>
    );
  }

  if (!cart) return null;
  const items = cart.items;
  const isEmpty = items.length === 0;

  if (isEmpty) {
    return (
      <div className="container max-w-md mx-auto py-20 text-center flex flex-col items-center px-4">
        <div className="p-6 rounded-full bg-secondary/40 text-muted-foreground/40 mb-6">
          <ShoppingCart className="h-14 w-14" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight mb-2">Your cart is empty</h1>
        <p className="text-muted-foreground mb-8 text-xs sm:text-sm leading-relaxed">
          Looks like you haven&apos;t added any items to your cart yet. Explore our curated collections!
        </p>
        <Link href="/products" className={buttonVariants({ size: "lg", className: "rounded-full px-8 font-bold shadow-md text-xs sm:text-sm h-11" })}>
          Continue Shopping
        </Link>
      </div>
    );
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);
  };

  const freeShippingThreshold = 50;
  const amountNeeded = Math.max(0, freeShippingThreshold - cart.subtotal);
  const progressPercent = Math.min(100, Math.round((cart.subtotal / freeShippingThreshold) * 100));

  return (
    <div className="container max-w-6xl mx-auto py-6 sm:py-8 px-4 sm:px-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">Shopping Cart</h1>
        <span className="text-xs font-bold text-muted-foreground bg-secondary/60 px-3 py-1 rounded-full">
          {items.length} {items.length === 1 ? 'item' : 'items'}
        </span>
      </div>

      {/* Free Shipping Progress Indicator */}
      <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 mb-6 flex flex-col gap-2 shadow-2xs">
        <div className="flex items-center justify-between text-xs font-bold text-foreground">
          <span className="flex items-center gap-1.5 text-primary">
            <Truck className="h-4 w-4 shrink-0" />
            {amountNeeded === 0
              ? '🎉 Congratulations! You have unlocked Free Shipping!'
              : `Add ${formatPrice(amountNeeded)} more to qualify for FREE Shipping!`}
          </span>
          <span className="text-muted-foreground font-mono text-[11px]">{progressPercent}%</span>
        </div>
        <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-500 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 sm:gap-8">
        {/* Cart Items List */}
        <div className="flex-1">
          <div className="space-y-3 sm:space-y-4">
            {items.map((item) => (
              <div
                key={item.productVariantId}
                className="flex flex-col sm:flex-row gap-3 sm:gap-4 p-3.5 sm:p-4 rounded-2xl border border-border/50 bg-card shadow-2xs"
              >
                {/* Image */}
                <div className="w-18 h-18 sm:w-24 sm:h-24 bg-secondary/30 rounded-xl border border-border/40 shrink-0 relative overflow-hidden flex items-center justify-center">
                  {item.imageUrl ? (
                    <img 
                      src={item.imageUrl} 
                      alt={item.title}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <ShoppingCart className="h-6 w-6 text-muted-foreground/30" />
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start gap-2">
                      <Link 
                        href={item.productSlug ? `/products/${item.productSlug}` : '#'} 
                        className="font-bold text-xs sm:text-sm hover:text-primary transition-colors line-clamp-2 text-foreground"
                      >
                        {item.title}
                      </Link>
                      <span className="font-extrabold text-foreground whitespace-nowrap text-sm sm:text-base">
                        {formatPrice(item.unitPrice)}
                      </span>
                    </div>

                    {item.attributes && Object.keys(item.attributes).length > 0 && (
                      <div className="mt-1 flex flex-wrap gap-1.5 text-[11px] text-muted-foreground">
                        {Object.entries(item.attributes).map(([k, v]) => (
                          <span key={k} className="bg-secondary/60 px-2 py-0.5 rounded-md capitalize font-medium">
                            {k}: {v}
                          </span>
                        ))}
                      </div>
                    )}

                    {!item.inStock && (
                      <div className="mt-1.5 text-xs text-destructive font-bold">Out of stock</div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-border/30">
                    <div className="flex items-center border rounded-full h-8 bg-background shadow-2xs overflow-hidden">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        aria-label="Decrease quantity"
                        className="h-full rounded-none w-8 text-muted-foreground hover:text-foreground"
                        onClick={() => updateQuantity.mutate({ itemId: item.productVariantId, quantity: item.quantity - 1 })}
                        disabled={item.quantity <= 1 || updateQuantity.isPending}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <div className="w-8 text-center text-xs font-bold">{item.quantity}</div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        aria-label="Increase quantity"
                        className="h-full rounded-none w-8 text-muted-foreground hover:text-foreground"
                        onClick={() => updateQuantity.mutate({ itemId: item.productVariantId, quantity: item.quantity + 1 })}
                        disabled={!item.inStock || updateQuantity.isPending}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>

                    <Button 
                      variant="ghost" 
                      size="icon" 
                      aria-label="Remove item from cart"
                      className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full h-8 w-8"
                      onClick={() => removeItem.mutate(item.productVariantId)}
                      disabled={removeItem.isPending}
                    >
                      {removeItem.isPending ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 sm:mt-6 flex justify-between items-center">
            <Button 
              variant="outline" 
              size="sm"
              className="text-muted-foreground rounded-full text-xs font-semibold h-8"
              onClick={() => clearCart.mutate()}
              disabled={clearCart.isPending}
            >
              Clear Cart
            </Button>
            <Link href="/products" className="text-xs text-primary font-bold hover:underline flex items-center gap-1">
              Add more items <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* Order Summary */}
        <div className="w-full lg:w-[360px] lg:shrink-0">
          <div className="bg-card rounded-2xl p-5 sm:p-6 border border-border/60 shadow-sm sticky top-24 space-y-5">
            <h2 className="text-lg font-black tracking-tight text-foreground">Order Summary</h2>
            
            <div className="space-y-3 text-xs sm:text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-bold">{formatPrice(cart.subtotal)}</span>
              </div>
              
              {cart.appliedCoupon && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Discount ({cart.appliedCoupon.code})</span>
                  <span>-{formatPrice(cart.appliedCoupon.discountAmount)}</span>
                </div>
              )}
              
              <div className="flex justify-between text-muted-foreground text-xs">
                <span>Shipping</span>
                <span>{amountNeeded === 0 ? <strong className="text-emerald-600 font-bold">FREE</strong> : 'Calculated at checkout'}</span>
              </div>

              <div className="flex justify-between text-muted-foreground text-xs">
                <span>Taxes</span>
                <span>Calculated at checkout</span>
              </div>

              <Separator className="my-3" />

              <div className="flex justify-between text-base font-black">
                <span>Estimated Total</span>
                <span className="text-primary">{formatPrice(cart.subtotal - (cart.appliedCoupon?.discountAmount || 0))}</span>
              </div>
            </div>

            <Button 
              className="w-full h-12 rounded-full font-bold shadow-md text-sm gap-2" 
              size="lg" 
              disabled={!items.some(i => i.inStock)}
              onClick={() => router.push('/checkout')}
            >
              Proceed to Checkout <ArrowRight className="h-4 w-4" />
            </Button>
            
            <div className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground pt-1">
              <Lock className="h-3.5 w-3.5 text-emerald-500" />
              <span>256-bit SSL Encrypted Checkout</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CartPage() {
  return (
    <ProtectedRoute>
      <CartContent />
    </ProtectedRoute>
  );
}
