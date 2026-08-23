"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Package, Heart, ShoppingBag, Loader2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Product } from '@/services/products.service';
import { useAuth } from '@/hooks/use-auth';
import { useWishlist, useAddToWishlist, useRemoveFromWishlist } from '@/features/wishlist/hooks/use-wishlist';
import { useAddToCart } from '@/features/cart/hooks/use-cart';
import { QuickViewDialog } from '@/components/storefront/quick-view-dialog';
import { formatCurrency, getDiscountDetails } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { requireAuth } = useAuth();
  const { data: wishlist } = useWishlist();
  const addToWishlist = useAddToWishlist();
  const removeFromWishlist = useRemoveFromWishlist();
  const addToCart = useAddToCart();

  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

  const discount = getDiscountDetails(product.basePrice, product.slug);

  const totalInventory = product.variants.reduce((acc, variant) => {
    return acc + (variant.inventory ? variant.inventory.quantity - variant.inventory.reservedQuantity : 0);
  }, 0);
  
  const isOutOfStock = totalInventory <= 0;
  const isInWishlist = wishlist?.items?.some(item => item.productId === product.id) ?? false;
  
  const defaultVariant = product.variants.find(v => {
    const inv = v.inventory;
    return inv ? inv.quantity - inv.reservedQuantity > 0 : false;
  }) || product.variants[0];

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
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

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!defaultVariant) return;

    requireAuth(
      () => {
        addToCart.mutate({ productVariantId: defaultVariant.id, quantity: 1 });
      },
      {
        pendingAction: 'ADD_TO_CART',
        payload: {
          productVariantId: defaultVariant.id,
          quantity: 1,
          title: product.title,
        },
        returnUrl: `/products/${product.slug}`,
        message: 'Please sign in to add items to your cart',
      }
    );
  };

  const handleQuickViewClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsQuickViewOpen(true);
  };

  return (
    <>
      <div className="group flex flex-col overflow-hidden transition-all duration-300 hover:border-zinc-700 border border-zinc-850 bg-zinc-900/60 relative rounded-md h-full p-0 m-0">
        {/* Image Area - 4:5 Fashion Aspect Ratio (Flush to Top) */}
        <div className="relative aspect-[4/5] w-full bg-zinc-950 flex items-center justify-center overflow-hidden rounded-t-md">
          <Link href={`/products/${product.slug}`} className="absolute inset-0 z-0 flex items-center justify-center">
            {product.images?.[0] ? (
              <img
                src={product.images[0].url}
                alt={`${product.title} - ${product.brand?.name || 'ASORA'} Streetwear`}
                loading="lazy"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80';
                }}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="text-zinc-700 flex flex-col items-center gap-2">
                <Package className="h-12 w-12" strokeWidth={1} />
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider">{product.brand?.name || 'ASORA'}</span>
              </div>
            )}
          </Link>
          
          {/* Quick View Button (Desktop Hover) */}
          <div className="absolute inset-x-0 bottom-2.5 z-10 hidden sm:flex justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 translate-y-2 group-hover:translate-y-0 px-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleQuickViewClick}
              className="w-full shadow-md backdrop-blur-md bg-zinc-950/90 hover:bg-rose-600 hover:text-white text-xs font-bold h-8 rounded gap-1.5 transition-colors border border-zinc-800"
            >
              <Eye className="h-3.5 w-3.5" />
              Quick View
            </Button>
          </div>
          
          {/* Badges: Sale & Out of Stock */}
          <div className="absolute top-2.5 left-2.5 z-20 flex flex-col gap-1.5 pointer-events-none">
            {isOutOfStock ? (
              <Badge variant="destructive" className="font-bold text-[9px] font-mono px-2 py-0.5 rounded uppercase">
                Sold Out
              </Badge>
            ) : discount.isSale ? (
              <Badge className="bg-rose-600 text-white font-black text-[9px] font-mono px-2 py-0.5 rounded border-none uppercase">
                -{discount.discountPercent}% OFF
              </Badge>
            ) : null}
          </div>
          
          {/* Wishlist Button */}
          <button 
            type="button"
            aria-label={isInWishlist ? `Remove ${product.title} from wishlist` : `Add ${product.title} to wishlist`}
            className={`absolute top-2.5 right-2.5 z-20 h-8 w-8 rounded bg-zinc-950/80 border border-zinc-800 shadow-2xs backdrop-blur-md transition-all hover:scale-110 flex items-center justify-center cursor-pointer ${
              isInWishlist ? 'text-rose-500 opacity-100' : 'text-zinc-400 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 hover:text-rose-500'
            }`}
            onClick={handleToggleWishlist}
          >
            <Heart className={`h-4 w-4 transition-colors ${isInWishlist ? 'fill-rose-500 text-rose-500' : ''}`} />
          </button>
        </div>

        {/* Details Area */}
        <div className="flex flex-col gap-0.5 p-3 flex-1 bg-zinc-900/60">
          <div className="text-[9px] text-zinc-400 font-mono font-bold uppercase tracking-widest truncate">
            {product.brand?.name || 'ASORA'}
          </div>

          <Link href={`/products/${product.slug}`} className="hover:text-rose-400 transition-colors line-clamp-1 mt-0.5">
            <h3 className="font-bold text-xs sm:text-sm leading-snug tracking-tight text-zinc-100 group-hover:text-rose-400 transition-colors truncate">
              {product.title}
            </h3>
          </Link>
        </div>

        {/* Footer Area with Price (Current + Strike-through Original) and Quick Add */}
        <div className="p-3 pt-2 flex items-center justify-between mt-auto border-t border-zinc-800/80 bg-zinc-900/60 rounded-b-md">
          <div className="flex flex-col">
            <span className="text-xs sm:text-sm font-black text-zinc-100 tracking-tight font-mono">
              {discount.formattedCurrent}
            </span>
            {discount.isSale && (
              <span className="text-[10px] text-zinc-500 line-through font-mono">
                {discount.formattedOriginal}
              </span>
            )}
          </div>
          
          <Button 
            size="icon" 
            variant={isOutOfStock ? 'outline' : 'secondary'} 
            disabled={isOutOfStock || addToCart.isPending} 
            aria-label={`Add ${product.title} to cart`}
            className="h-8 w-8 rounded bg-zinc-800 hover:bg-rose-600 hover:text-white text-zinc-200 border border-zinc-700 transition-colors shrink-0"
            onClick={handleAddToCart}
          >
            {addToCart.isPending ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <ShoppingBag className="h-3.5 w-3.5" />
            )}
          </Button>
        </div>
      </div>

      {/* Quick View Modal */}
      <QuickViewDialog
        product={product}
        open={isQuickViewOpen}
        onOpenChange={setIsQuickViewOpen}
      />
    </>
  );
}
