"use client";

import { useCart, useUpdateCartItem, useRemoveCartItem, useClearCart } from '@/features/cart/hooks/use-cart';
import { Button, buttonVariants } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { ShoppingCart, Trash2, Plus, Minus, PackageX } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CartPage() {
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
          {[1, 2].map(i => (
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
        <PackageX className="h-16 w-16 text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold mb-2">Could not load cart</h1>
        <p className="text-muted-foreground mb-6">Something went wrong while fetching your cart.</p>
        <Button onClick={() => refetch()}>Try Again</Button>
      </div>
    );
  }

  if (!cart) return null;
  const items = cart.items;
  const isEmpty = items.length === 0;

  if (isEmpty) {
    return (
      <div className="container py-20 text-center flex flex-col items-center">
        <ShoppingCart className="h-24 w-24 text-muted-foreground/30 mb-6" />
        <h1 className="text-3xl font-bold mb-4">Your cart is empty</h1>
        <p className="text-muted-foreground mb-8 text-lg">Looks like you haven&apos;t added anything to your cart yet.</p>
        <Link href="/products" className={buttonVariants({ size: "lg" })}>
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
        <h1 className="text-3xl font-bold">Shopping Cart</h1>
        <span className="text-muted-foreground">{items.length} {items.length === 1 ? 'item' : 'items'}</span>
      </div>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Cart Items List */}
        <div className="flex-1">
          <div className="space-y-8">
            {items.map((item) => (
              <div key={item.productVariantId} className="flex flex-col sm:flex-row gap-6 pb-8 border-b">
                {/* Image */}
                <div className="w-24 h-24 sm:w-32 sm:h-32 bg-muted rounded-md border flex-shrink-0 relative overflow-hidden">
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
                        className="font-semibold text-lg hover:underline line-clamp-2"
                      >
                        {item.title}
                      </Link>
                      <span className="font-bold whitespace-nowrap">{formatPrice(item.unitPrice)}</span>
                    </div>

                    <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                      {Object.entries(item.attributes).map(([k, v]) => (
                        <div key={k} className="capitalize">{k}: {v}</div>
                      ))}
                    </div>

                    {!item.inStock && (
                      <div className="mt-2 text-sm text-destructive font-medium">Out of stock</div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center border rounded-md h-10">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-full rounded-none w-10"
                        onClick={() => updateQuantity.mutate({ itemId: item.productVariantId, quantity: item.quantity - 1 })}
                        disabled={item.quantity <= 1 || updateQuantity.isPending}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <div className="w-10 text-center text-sm font-medium">{item.quantity}</div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-full rounded-none w-10"
                        onClick={() => updateQuantity.mutate({ itemId: item.productVariantId, quantity: item.quantity + 1 })}
                        disabled={!item.inStock || updateQuantity.isPending}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>

                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => removeItem.mutate(item.productVariantId)}
                      disabled={removeItem.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Remove item</span>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-start">
            <Button 
              variant="outline" 
              className="text-muted-foreground"
              onClick={() => clearCart.mutate()}
              disabled={clearCart.isPending}
            >
              Clear Cart
            </Button>
          </div>
        </div>

        {/* Order Summary */}
        <div className="w-full lg:w-[350px] lg:flex-shrink-0">
          <div className="bg-muted/30 rounded-xl p-6 border sticky top-24">
            <h2 className="text-xl font-bold mb-6">Order Summary</h2>
            
            <div className="space-y-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatPrice(cart.subtotal)}</span>
              </div>
              
              {cart.appliedCoupon && (
                <div className="flex justify-between text-emerald-600">
                  <span>Discount ({cart.appliedCoupon.code})</span>
                  <span>-{formatPrice(cart.appliedCoupon.discountAmount)}</span>
                </div>
              )}
              
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>Calculated at checkout</span>
              </div>

              <div className="flex justify-between">
                <span className="text-muted-foreground">Taxes</span>
                <span>Calculated at checkout</span>
              </div>

              <Separator className="my-4" />

              <div className="flex justify-between text-base font-bold">
                <span>Total</span>
                <span>{formatPrice(cart.subtotal - (cart.appliedCoupon?.discountAmount || 0))}</span>
              </div>
            </div>

            <Button 
              className="w-full mt-8" 
              size="lg" 
              disabled={!items.some(i => i.inStock)}
              onClick={() => router.push('/checkout')}
            >
              Proceed to Checkout
            </Button>
            
            <p className="text-xs text-center text-muted-foreground mt-4">
              Shipping and taxes calculated during checkout.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
