"use client";

import { useCart, useUpdateCartItem, useRemoveCartItem, useClearCart } from '@/features/cart/hooks/use-cart';
import { Button, buttonVariants } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  ShoppingCart, Trash2, Plus, Minus, PackageX, Loader2, 
  ArrowRight, Truck, ShieldCheck, Lock, Scissors, Sparkles, ShoppingBag
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Breadcrumbs } from '@/components/shared/breadcrumbs';
import { formatCurrency } from '@/lib/utils';
import { WhatsAppOrderDialog } from '@/components/storefront/whatsapp-order-dialog';
import { toast } from 'sonner';

export default function CartPage() {
  const router = useRouter();
  const { data: cart, isLoading, isError, refetch } = useCart();
  const updateQuantity = useUpdateCartItem();
  const removeItem = useRemoveCartItem();
  const clearCart = useClearCart();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100">
        <div className="container max-w-6xl mx-auto py-8 sm:py-12 px-4 sm:px-6 space-y-6">
          <Skeleton className="h-8 w-48 bg-zinc-800 rounded" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="flex gap-4 p-4 rounded bg-zinc-900 border border-zinc-800">
                  <Skeleton className="h-24 w-20 bg-zinc-800 rounded" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-3/4 bg-zinc-800" />
                    <Skeleton className="h-4 w-1/3 bg-zinc-800" />
                  </div>
                </div>
              ))}
            </div>
            <div className="lg:col-span-4">
              <Skeleton className="h-64 w-full bg-zinc-900 rounded border border-zinc-800" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 container max-w-md mx-auto py-24 text-center flex flex-col items-center px-4">
        <div className="p-5 rounded-full bg-zinc-900 border border-zinc-800 text-rose-500 mb-5">
          <PackageX className="h-10 w-10" />
        </div>
        <h1 className="text-xl font-bold font-mono uppercase mb-2">COULD NOT LOAD CART</h1>
        <p className="text-zinc-400 mb-6 text-xs leading-relaxed">
          Something went wrong while fetching your cart details. Please check your connection.
        </p>
        <Button onClick={() => refetch()} className="bg-rose-600 hover:bg-rose-700 font-mono text-xs uppercase px-6 h-10 font-bold rounded">
          TRY AGAIN
        </Button>
      </div>
    );
  }

  const items = cart?.items || [];
  const isEmpty = items.length === 0;

  if (isEmpty) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center py-20 px-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="h-20 w-20 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-500 flex items-center justify-center mx-auto">
            <ShoppingBag className="h-9 w-9 text-rose-500" />
          </div>
          
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-rose-400 text-[10px] font-mono font-bold uppercase tracking-widest">
              ASORA BAG
            </div>
            <h1 className="text-3xl sm:text-4xl font-black font-sans tracking-tight text-zinc-100 uppercase">
              YOUR CART IS EMPTY.
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-sm mx-auto">
              Your next favorite streetwear piece or custom artwork is waiting.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link
              href="/products"
              className={buttonVariants({
                className: "bg-rose-600 hover:bg-rose-700 text-white font-mono font-bold text-xs uppercase tracking-wider h-11 px-6 rounded shadow-xl gap-2",
              })}
            >
              <ShoppingBag className="h-4 w-4" />
              <span>SHOP THE COLLECTION</span>
            </Link>
            <Link
              href="/customizer"
              className={buttonVariants({
                variant: "outline",
                className: "border-zinc-800 bg-zinc-900 text-zinc-200 hover:bg-zinc-850 font-mono font-bold text-xs uppercase tracking-wider h-11 px-6 rounded gap-2",
              })}
            >
              <Scissors className="h-4 w-4 text-rose-500" />
              <span>CREATE CUSTOM TEE</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const subtotal = cart?.subtotal || 0;
  const appliedCoupon = cart?.appliedCoupon || null;
  const freeShippingThreshold = 2500;
  const amountNeeded = Math.max(0, freeShippingThreshold - subtotal);
  const progressPercent = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 pb-20">
      <div className="container max-w-6xl mx-auto py-6 sm:py-10 px-4 sm:px-6 space-y-6">
        
        {/* Breadcrumbs */}
        <Breadcrumbs items={[
          { label: 'HOME', href: '/' },
          { label: 'SHOPPING CART', href: '/cart' },
        ]} className="text-zinc-500 font-mono text-[11px]" />

        {/* Cart Header */}
        <div className="flex items-center justify-between border-b border-zinc-850 pb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-100 uppercase">
              YOUR CART
            </h1>
            <p className="text-xs font-mono text-zinc-400 mt-0.5">
              Review your selected pieces and custom designs before checkout.
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-rose-400 bg-zinc-900 border border-zinc-800 px-3 py-1 rounded">
            {items.length} {items.length === 1 ? 'PIECE' : 'PIECES'}
          </span>
        </div>

        {/* Free Shipping Progress Indicator */}
        <div className="p-4 rounded bg-zinc-900 border border-zinc-800 flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="flex items-center gap-2 text-zinc-200">
              <Truck className="h-4 w-4 text-rose-500 shrink-0" />
              {amountNeeded === 0 ? (
                <span className="text-emerald-400 font-bold">
                  FREE NATIONWIDE DELIVERY UNLOCKED!
                </span>
              ) : (
                <span>
                  Add <strong className="text-rose-400">{formatCurrency(amountNeeded)}</strong> more to get FREE Delivery!
                </span>
              )}
            </span>
            <span className="text-zinc-400 text-[11px] font-bold">{progressPercent}%</span>
          </div>
          <div className="w-full bg-zinc-950 h-1.5 rounded-full overflow-hidden border border-zinc-800">
            <div
              className="bg-rose-600 h-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* ── CART LAYOUT: ITEMS & SUMMARY ────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left: Items List (8 cols) */}
          <div className="lg:col-span-8 space-y-3">
            {items.map((item) => {
              const isCustom = Boolean(item.customConfig);
              const custom = item.customConfig;

              return (
                <div
                  key={item.id || item.productVariantId}
                  className="p-4 rounded bg-zinc-900 border border-zinc-800 flex flex-col sm:flex-row gap-4 justify-between"
                >
                  {/* Thumbnail */}
                  <div className="flex gap-4">
                    <div className="w-20 h-24 bg-zinc-950 rounded border border-zinc-800 shrink-0 relative overflow-hidden flex items-center justify-center p-1">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="object-contain w-full h-full"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/images/asora-hero.jpg';
                          }}
                        />
                      ) : (
                        <ShoppingCart className="h-6 w-6 text-zinc-600" />
                      )}
                    </div>

                    {/* Details */}
                    <div className="space-y-1 text-left">
                      {isCustom ? (
                        <div>
                          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-rose-600/10 border border-rose-500/20 text-rose-400 font-mono text-[10px] font-bold uppercase tracking-wider mb-1">
                            <Scissors className="h-3 w-3" /> CUSTOM ASORA T-SHIRT
                          </div>
                          <h3 className="font-bold text-sm text-zinc-100 uppercase">
                            {custom?.shirtType?.toUpperCase() || 'OVERSIZED'} CUSTOM T-SHIRT
                          </h3>
                          <div className="text-[11px] font-mono text-zinc-400 space-y-0.5 mt-1">
                            <p>Color: <span className="text-zinc-200">{custom?.color}</span> • Size: <span className="text-zinc-200">{custom?.size}</span></p>
                            <p>Placement: <span className="text-rose-400">{custom?.printPosition?.replace('_', ' + ').toUpperCase()}</span></p>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <Link
                            href={item.productSlug ? `/products/${item.productSlug}` : '#'}
                            className="font-bold text-sm text-zinc-100 hover:text-rose-400 transition-colors uppercase line-clamp-1"
                          >
                            {item.title}
                          </Link>
                          {item.attributes && Object.keys(item.attributes).length > 0 && (
                            <div className="mt-1 flex flex-wrap gap-1.5 text-[11px] font-mono text-zinc-400">
                              {Object.entries(item.attributes).map(([k, v]) => (
                                <span key={k} className="bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800 uppercase">
                                  {k}: {v}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {!item.inStock && (
                        <span className="text-[11px] font-mono text-rose-500 font-bold block mt-1">
                          OUT OF STOCK
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Quantity & Price Column */}
                  <div className="flex sm:flex-col justify-between sm:items-end items-center gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-zinc-800/80">
                    <span className="font-black font-mono text-base text-zinc-100">
                      {formatCurrency(item.subtotal)}
                    </span>

                    {/* Stepper */}
                    <div className="flex items-center border border-zinc-800 rounded bg-zinc-950 h-8">
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Decrease quantity"
                        className="h-full w-8 rounded-none text-zinc-400 hover:text-zinc-100 disabled:opacity-30"
                        onClick={() => updateQuantity.mutate({ itemId: item.productVariantId, quantity: item.quantity - 1 })}
                        disabled={item.quantity <= 1 || updateQuantity.isPending}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center font-mono font-bold text-xs text-zinc-100">
                        {item.quantity}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Increase quantity"
                        className="h-full w-8 rounded-none text-zinc-400 hover:text-zinc-100"
                        onClick={() => updateQuantity.mutate({ itemId: item.productVariantId, quantity: item.quantity + 1 })}
                        disabled={updateQuantity.isPending}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>

                    {/* Remove button */}
                    <button
                      type="button"
                      onClick={() => removeItem.mutate(item.productVariantId)}
                      disabled={removeItem.isPending}
                      className="text-zinc-500 hover:text-rose-400 transition-colors text-xs font-mono flex items-center gap-1"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>REMOVE</span>
                    </button>
                  </div>

                </div>
              );
            })}

            {/* Actions below items */}
            <div className="flex justify-between items-center pt-2">
              <Link
                href="/products"
                className="text-xs font-mono text-zinc-400 hover:text-rose-400 flex items-center gap-1.5 uppercase transition-colors"
              >
                <span>← CONTINUE SHOPPING</span>
              </Link>

              <button
                type="button"
                onClick={() => clearCart.mutate()}
                disabled={clearCart.isPending}
                className="text-xs font-mono text-zinc-500 hover:text-rose-400 transition-colors uppercase"
              >
                CLEAR CART
              </button>
            </div>
          </div>

          {/* Right: Sticky Order Summary (4 cols) */}
          <div className="lg:col-span-4 sticky top-24 space-y-4">
            <div className="p-6 rounded bg-zinc-900 border border-zinc-800 space-y-4">
              <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-zinc-200 border-b border-zinc-850 pb-3">
                ORDER SUMMARY
              </h2>

              <div className="space-y-2.5 text-xs font-mono">
                <div className="flex justify-between text-zinc-400">
                  <span>Subtotal:</span>
                  <span className="text-zinc-100">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Nationwide Shipping:</span>
                  <span className={amountNeeded === 0 ? 'text-emerald-400 font-bold' : 'text-zinc-100'}>
                    {amountNeeded === 0 ? 'FREE' : formatCurrency(200)}
                  </span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-rose-400">
                    <span>Discount ({appliedCoupon.code}):</span>
                    <span>-{formatCurrency(appliedCoupon.discountAmount)}</span>
                  </div>
                )}
                
                <div className="flex justify-between text-base font-black text-zinc-100 border-t border-zinc-800 pt-3 mt-3">
                  <span>ESTIMATED TOTAL:</span>
                  <span className="text-rose-500 font-mono">
                    {formatCurrency(subtotal + (amountNeeded === 0 ? 0 : 200) - (appliedCoupon?.discountAmount || 0))}
                  </span>
                </div>
              </div>

              <div className="pt-2 space-y-2">
                <Link
                  href="/checkout"
                  className={buttonVariants({
                    className: "w-full h-12 bg-rose-600 hover:bg-rose-700 text-white font-mono font-black text-xs uppercase tracking-widest rounded shadow-xl flex items-center justify-center gap-2",
                  })}
                >
                  <Lock className="h-4 w-4" />
                  <span>PROCEED TO CHECKOUT</span>
                </Link>

                <WhatsAppOrderDialog
                  items={items.map((it: any) => ({
                    title: it.title,
                    size: it.attributes?.size || it.attributes?.Size,
                    color: it.attributes?.color || it.attributes?.Color,
                    quantity: it.quantity,
                    price: it.price,
                  }))}
                  totalPrice={subtotal + (amountNeeded === 0 ? 0 : 200) - (appliedCoupon?.discountAmount || 0)}
                  triggerText="ORDER CART ON WHATSAPP"
                  triggerClassName="w-full h-11 border-emerald-900/40 bg-emerald-950/30 hover:bg-emerald-900/50 text-emerald-400 font-mono font-bold text-xs uppercase tracking-wider rounded gap-2 flex items-center justify-center shadow-md"
                  isCart={true}
                />
              </div>

              {/* Trust Badges */}
              <div className="border-t border-zinc-850 pt-4 space-y-2 text-[11px] font-mono text-zinc-400">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-rose-500 shrink-0" />
                  <span>Cash on Delivery & Secure Cards</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-rose-500 shrink-0" />
                  <span>Nationwide Delivery across Pakistan</span>
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
