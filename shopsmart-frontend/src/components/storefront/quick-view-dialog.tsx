"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Product } from '@/services/products.service';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button, buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StarRating } from '@/features/reviews/components/star-rating';
import { useAuth } from '@/hooks/use-auth';
import { useAddToCart } from '@/features/cart/hooks/use-cart';
import { useWishlist, useAddToWishlist, useRemoveFromWishlist } from '@/features/wishlist/hooks/use-wishlist';
import { ShoppingBag, Heart, Loader2, Plus, Minus, ArrowRight, ShieldCheck, Truck, Package } from 'lucide-react';
import { formatCurrency, getDiscountDetails } from '@/lib/utils';

interface QuickViewDialogProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QuickViewDialog({ product, open, onOpenChange }: QuickViewDialogProps) {
  const { requireAuth } = useAuth();
  const addToCart = useAddToCart();
  const { data: wishlist } = useWishlist();
  const addToWishlist = useAddToWishlist();
  const removeFromWishlist = useRemoveFromWishlist();

  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  if (!product) return null;

  const variants = product.variants || [];
  const selectedVariant = variants[selectedVariantIndex] || variants[0];
  const images = product.images && product.images.length > 0 ? product.images : [];
  const activeImage = images[activeImageIndex]?.url;

  const isInWishlist = wishlist?.items?.some((item) => item.productId === product.id) ?? false;
  const isOutOfStock = (selectedVariant?.inventory?.quantity ?? 0) <= (selectedVariant?.inventory?.reservedQuantity ?? 0);

  const basePrice = parseFloat(product.basePrice);
  const priceModifier = selectedVariant ? parseFloat(selectedVariant.priceModifier || '0') : 0;
  const finalPrice = basePrice + priceModifier;

  const discount = getDiscountDetails(finalPrice, product.slug);

  const handleAddToCart = () => {
    if (!selectedVariant) return;
    requireAuth(
      () => {
        addToCart.mutate({
          productVariantId: selectedVariant.id,
          quantity,
        });
        onOpenChange(false);
      },
      {
        pendingAction: 'ADD_TO_CART',
        payload: {
          productVariantId: selectedVariant.id,
          quantity,
          title: product.title,
        },
        returnUrl: `/products/${product.slug}`,
        message: 'Please sign in to add items to your cart',
      }
    );
  };

  const handleToggleWishlist = () => {
    requireAuth(
      () => {
        if (isInWishlist) {
          removeFromWishlist.mutate(product.id);
        } else {
          addToWishlist.mutate(product.id);
        }
      },
      {
        message: 'Sign in to save items to your wishlist',
        returnUrl: `/products/${product.slug}`,
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl md:max-w-3xl p-0 overflow-hidden rounded-3xl border-border/60 shadow-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
          {/* Left: Product Images (4:5 Ratio) */}
          <div className="bg-secondary/30 p-6 flex flex-col justify-between items-center border-b md:border-b-0 md:border-r border-border/50">
            <div className="relative aspect-[4/5] w-full rounded-2xl bg-card border border-border/40 overflow-hidden flex items-center justify-center shadow-xs">
              {activeImage ? (
                <img
                  src={activeImage}
                  alt={product.title}
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="text-muted-foreground/30 flex flex-col items-center">
                  <Package className="h-16 w-16" strokeWidth={1} />
                </div>
              )}

              {/* Wishlist Button */}
              <button
                type="button"
                onClick={handleToggleWishlist}
                aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
                className="absolute top-3 right-3 p-2 rounded-full bg-background/90 backdrop-blur-md shadow-xs text-muted-foreground hover:text-primary transition-all"
              >
                <Heart className={`h-4 w-4 ${isInWishlist ? 'fill-primary text-primary' : ''}`} />
              </button>
            </div>

            {/* Thumbnail selector */}
            {images.length > 1 && (
              <div className="flex items-center gap-2 mt-4 overflow-x-auto max-w-full pb-1">
                {images.map((img, idx) => (
                  <button
                    key={img.id || idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    className={`h-12 w-10 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                      activeImageIndex === idx ? 'border-primary shadow-xs' : 'border-border/40 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img.url} alt="" className="object-cover w-full h-full" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Product Details & Actions */}
          <div className="p-6 flex flex-col justify-between max-h-[80vh] overflow-y-auto">
            <div>
              <DialogHeader className="p-0 text-left">
                <div className="text-[11px] font-mono font-bold text-zinc-400 uppercase tracking-widest mb-1">
                  {product.brand?.name || 'ASORA'}
                </div>
                <DialogTitle className="text-xl sm:text-2xl font-extrabold tracking-tight text-zinc-100 leading-snug">
                  {product.title}
                </DialogTitle>
                <DialogDescription className="sr-only">
                  Quick view details for {product.title}
                </DialogDescription>
              </DialogHeader>

              {/* Price & Stock */}
              <div className="flex items-center gap-3 mt-4 pb-4 border-b border-border/50">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-foreground">{discount.formattedCurrent}</span>
                  {discount.isSale && (
                    <span className="text-xs text-muted-foreground line-through font-bold">{discount.formattedOriginal}</span>
                  )}
                </div>
                {discount.isSale && (
                  <Badge className="bg-rose-600 text-white font-black text-[10px] border-none">
                    -{discount.discountPercent}% OFF
                  </Badge>
                )}
                {isOutOfStock ? (
                  <Badge variant="destructive" className="font-semibold text-xs ml-auto">Out of Stock</Badge>
                ) : (
                  <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 font-semibold text-xs ml-auto">
                    In Stock
                  </Badge>
                )}
              </div>

              {/* Short Description */}
              {product.description && (
                <p className="text-xs text-muted-foreground mt-4 line-clamp-3 leading-relaxed">
                  {product.description}
                </p>
              )}

              {/* Size & Color Variants Selector */}
              {variants.length > 1 && (
                <div className="mt-4 space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Select Size / Option
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {variants.map((v, i) => {
                      const label = v.attributes && Object.keys(v.attributes).length > 0
                        ? Object.values(v.attributes).join(' / ')
                        : v.sku || `Option ${i + 1}`;
                      return (
                        <button
                          key={v.id}
                          type="button"
                          onClick={() => setSelectedVariantIndex(i)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                            selectedVariantIndex === i
                              ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                              : 'bg-background text-foreground border-border hover:border-primary/50'
                          }`}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Quantity Stepper */}
              <div className="mt-4 flex items-center gap-4">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Quantity
                </span>
                <div className="flex items-center border rounded-full bg-background h-9 shadow-xs overflow-hidden">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-full rounded-none w-8 text-muted-foreground hover:text-foreground"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="w-8 text-center text-xs font-bold">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-full rounded-none w-8 text-muted-foreground hover:text-foreground"
                    onClick={() => setQuantity((q) => q + 1)}
                    disabled={isOutOfStock}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 pt-4 border-t border-border/50 space-y-2.5">
              <Button
                className="w-full h-11 rounded-full font-bold shadow-md gap-2"
                disabled={isOutOfStock || addToCart.isPending}
                onClick={handleAddToCart}
              >
                {addToCart.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ShoppingBag className="h-4 w-4" />
                )}
                Add to Cart
              </Button>

              <Link
                href={`/products/${product.slug}`}
                onClick={() => onOpenChange(false)}
                className={buttonVariants({
                  variant: 'outline',
                  className: 'w-full h-10 rounded-full font-semibold text-xs gap-1.5 border-border/80',
                })}
              >
                View Full Details <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
