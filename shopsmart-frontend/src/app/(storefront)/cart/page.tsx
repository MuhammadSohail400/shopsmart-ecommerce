"use client";

import { useCart, useUpdateCartItem, useRemoveCartItem, useClearCart } from '@/features/cart/hooks/use-cart';
import { Button, buttonVariants } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { ShoppingCart, Trash2, Plus, Minus, PackageX, Loader2, ArrowRight } from 'lucide-react';
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
      <div className="container py-8 max-w-4xl">
        <Skeleton className="h-10 w-48 mb-8" />
        <div className="space-y-6">
          {[1, 2].map((i) => (
            <div key={i} className="flex gap-4">
              <Skeleton className="h-24 w-24 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/4" />
              </div>
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
          <PackageX className="h-12 w-12" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Could not load your cart</h1>
        <p className="text-muted-foreground mb-6 text-sm max-w-md">
          Something went wrong while fetching your cart details. Please check your connection and try again.
        </p>
        <Button onClick={() => refetch()} className="rounded-full px-6">
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
      <div className="container py-20 text-center flex flex-col items-center">
        <div className="p-6 rounded-full bg-secondary/40 text-muted-foreground/40 mb-6">
          <ShoppingCart className="h-16 w-16" />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight mb-3">Your cart is empty</h1>
        <p className="text-muted-foreground mb-8 text-base max-w-sm">
          Looks like you haven&apos;t added any items to your cart yet. Explore our curated collections!
        </p>
        <Link href="/products" className={buttonVariants({ size: "lg", className: "rounded-full px-8 font-semibold shadow-md" })}>
          Continue Shopping
        </Link>
      </div>
    );
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);
  };

  return (
    <div className="container py-8 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight">Shopping Cart</h1>
        <span className="text-sm font-semibold text-muted-foreground bg-secondary/50 px-3 py-1 rounded-full">
          {items.length} {items.length === 1 ? 'item' : 'items'}
        </span>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Cart Items List */}
        <div className="flex-1">
          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={item.productVariantId}
                className="flex flex-col sm:flex-row gap-4 p-4 rounded-2xl border border-border/50 bg-card shadow-xs"
              >
                {/* Image */}
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-muted rounded-xl border border-border/40 flex-shrink-0 relative overflow-hidden">
                  {item.imageUrl ? (
                    <img 
                      src={item.imageUrl} 
                      alt={item.title}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full text-muted-foreground/30">
                      <ShoppingCart className="h-8 w-8" />
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start gap-4">
                      <Link 
                        href={item.productSlug ? `/products/${item.productSlug}` : '#'} 
                        className="font-bold text-base hover:text-primary transition-colors line-clamp-2"
                      >
                        {item.title}
                      </Link>
                      <span className="font-extrabold text-foreground whitespace-nowrap text-base">
                        {formatPrice(item.unitPrice)}
                      </span>
                    </div>

                    <div className="mt-1 flex flex-wrap gap-2 text-xs text-muted-foreground">
                      {Object.entries(item.attributes).map(([k, v]) => (
                        <span key={k} className="bg-secondary/40 px-2 py-0.5 rounded-md capitalize">
                          {k}: {v}
                        </span>
                      ))}
                    </div>

                    {!item.inStock && (
                      <div className="mt-2 text-xs text-destructive font-semibold">Out of stock</div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between mt-4 pt-2 border-t border-border/30">
                    <div className="flex items-center border rounded-full h-9 bg-background shadow-xs overflow-hidden">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        aria-label="Decrease quantity"
                        className="h-full rounded-none w-9 text-muted-foreground hover:text-foreground"
                        onClick={() => updateQuantity.mutate({ itemId: item.productVariantId, quantity: item.quantity - 1 })}
                        disabled={item.quantity <= 1 || updateQuantity.isPending}
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </Button>
                      <div className="w-9 text-center text-sm font-bold">{item.quantity}</div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        aria-label="Increase quantity"
                        className="h-full rounded-none w-9 text-muted-foreground hover:text-foreground"
                        onClick={() => updateQuantity.mutate({ itemId: item.productVariantId, quantity: item.quantity + 1 })}
                        disabled={!item.inStock || updateQuantity.isPending}
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </Button>
                    </div>

                    <Button 
                      variant="ghost" 
                      size="icon" 
                      aria-label="Remove item from cart"
                      className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full h-9 w-9"
                      onClick={() => removeItem.mutate(item.productVariantId)}
                      disabled={removeItem.isPending}
                    >
                      {removeItem.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-between items-center">
            <Button 
              variant="outline" 
              size="sm"
              className="text-muted-foreground rounded-full text-xs font-semibold"
              onClick={() => clearCart.mutate()}
              disabled={clearCart.isPending}
            >
              Clear Cart
            </Button>
            <Link href="/products" className="text-xs text-primary font-semibold hover:underline flex items-center gap-1">
              Add more items <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* Order Summary */}
        <div className="w-full lg:w-[360px] lg:flex-shrink-0">
          <div className="bg-card rounded-2xl p-6 border border-border/60 shadow-sm sticky top-24">
            <h2 className="text-xl font-extrabold mb-6 tracking-tight">Order Summary</h2>
            
            <div className="space-y-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-semibold">{formatPrice(cart.subtotal)}</span>
              </div>
              
              {cart.appliedCoupon && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Discount ({cart.appliedCoupon.code})</span>
                  <span>-{formatPrice(cart.appliedCoupon.discountAmount)}</span>
                </div>
              )}
              
              <div className="flex justify-between text-muted-foreground text-xs">
                <span>Shipping</span>
                <span>Calculated at checkout</span>
              </div>

              <div className="flex justify-between text-muted-foreground text-xs">
                <span>Taxes</span>
                <span>Calculated at checkout</span>
              </div>

              <Separator className="my-4" />

              <div className="flex justify-between text-lg font-extrabold">
                <span>Estimated Total</span>
                <span className="text-primary">{formatPrice(cart.subtotal - (cart.appliedCoupon?.discountAmount || 0))}</span>
              </div>
            </div>

            <Button 
              className="w-full mt-6 h-12 rounded-full font-bold shadow-md text-base" 
              size="lg" 
              disabled={!items.some(i => i.inStock)}
              onClick={() => router.push('/checkout')}
            >
              Proceed to Checkout
            </Button>
            
            <p className="text-[11px] text-center text-muted-foreground mt-4">
              Secure 256-bit SSL encrypted checkout.
            </p>
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
