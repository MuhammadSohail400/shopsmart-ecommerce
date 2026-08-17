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
      <Card className="group flex flex-col overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-primary/40 border-border/50 bg-card relative rounded-2xl h-full shadow-2xs">
        {/* Image Area - 4:5 Fashion Aspect Ratio */}
        <div className="relative aspect-[4/5] w-full bg-secondary/30 flex items-center justify-center overflow-hidden">
          <Link href={`/products/${product.slug}`} className="absolute inset-0 z-0 flex items-center justify-center">
            {product.images?.[0] ? (
              <img
                src={product.images[0].url}
                alt={product.title}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="text-muted-foreground/30 flex flex-col items-center gap-2">
                <Package className="h-12 w-12" strokeWidth={1} />
                <span className="text-xs font-bold uppercase tracking-wider">{product.brand?.name || 'ShopSmart'}</span>
              </div>
            )}
          </Link>
          
          {/* Quick View Button (Desktop Hover) */}
          <div className="absolute inset-x-0 bottom-3 z-10 hidden sm:flex justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 translate-y-2 group-hover:translate-y-0 px-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleQuickViewClick}
              className="w-full shadow-md backdrop-blur-md bg-background/90 hover:bg-primary hover:text-primary-foreground text-xs font-bold h-8 rounded-xl gap-1.5 transition-colors"
            >
              <Eye className="h-3.5 w-3.5" />
              Quick View
            </Button>
          </div>
          
          {/* Badges: Sale & Out of Stock */}
          <div className="absolute top-2.5 left-2.5 z-20 flex flex-col gap-1.5 pointer-events-none">
            {isOutOfStock ? (
              <Badge variant="destructive" className="shadow-xs font-bold text-[10px] px-2 py-0.5 rounded-md">
                Out of Stock
              </Badge>
            ) : discount.isSale ? (
              <Badge className="bg-rose-600 text-white shadow-xs font-black text-[10px] px-2 py-0.5 rounded-md border-none">
                -{discount.discountPercent}%
              </Badge>
            ) : null}
          </div>
          
          {/* Wishlist Button */}
          <Button 
            variant="ghost" 
            size="icon" 
            aria-label={isInWishlist ? `Remove ${product.title} from wishlist` : `Add ${product.title} to wishlist`}
            className={`absolute top-2.5 right-2.5 z-20 h-8 w-8 rounded-full bg-background/90 shadow-2xs backdrop-blur-md transition-all hover:scale-110 hover:bg-background ${
              isInWishlist ? 'text-primary opacity-100' : 'text-muted-foreground opacity-90 sm:opacity-0 sm:group-hover:opacity-100 hover:text-primary'
            }`}
            onClick={handleToggleWishlist}
            disabled={addToWishlist.isPending || removeFromWishlist.isPending}
          >
            {addToWishlist.isPending || removeFromWishlist.isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
            ) : (
              <Heart className={`h-3.5 w-3.5 transition-colors ${isInWishlist ? 'fill-primary text-primary' : ''}`} />
            )}
          </Button>
        </div>

        {/* Details Area */}
        <CardContent className="flex flex-col gap-1 p-3 sm:p-3.5 flex-1">
          <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest truncate">
            {product.brand?.name || 'ShopSmart'}
          </div>

          <Link href={`/products/${product.slug}`} className="hover:text-primary transition-colors line-clamp-2 mt-0.5">
            <h3 className="font-bold text-xs sm:text-sm leading-snug tracking-tight text-foreground group-hover:text-primary transition-colors">
              {product.title}
            </h3>
          </Link>
        </CardContent>

        {/* Footer Area with Price (Current + Strike-through Original) and Quick Add */}
        <CardFooter className="p-3 sm:p-3.5 pt-0 flex items-center justify-between mt-auto border-t border-border/30 pt-2.5">
          <div className="flex flex-col">
            <span className="text-sm sm:text-base font-extrabold text-foreground tracking-tight">
              {discount.formattedCurrent}
            </span>
            {discount.isSale && (
              <span className="text-[11px] text-muted-foreground line-through font-semibold">
                {discount.formattedOriginal}
              </span>
            )}
          </div>
          
          <Button 
            size="icon" 
            variant={isOutOfStock ? 'outline' : 'secondary'} 
            disabled={isOutOfStock || addToCart.isPending} 
            aria-label={`Add ${product.title} to cart`}
            className="h-8 w-8 sm:h-8.5 sm:w-8.5 rounded-full transition-transform hover:scale-108 hover:bg-primary hover:text-primary-foreground shadow-2xs bg-secondary/80 shrink-0"
            onClick={handleAddToCart}
          >
            {addToCart.isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <ShoppingBag className="h-3.5 w-3.5" />
            )}
          </Button>
        </CardFooter>
      </Card>

      {/* Quick View Modal */}
      <QuickViewDialog
        product={product}
        open={isQuickViewOpen}
        onOpenChange={setIsQuickViewOpen}
      />
    </>
  );
}
