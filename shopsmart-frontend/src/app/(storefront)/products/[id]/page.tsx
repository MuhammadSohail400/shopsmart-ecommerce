"use client";

import { useState, useEffect, use } from 'react';
import { useProduct } from '@/hooks/use-catalog';
import { Skeleton } from '@/components/ui/skeleton';
import { Button, buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingBag, Star, Package, Shield, Truck, RefreshCw, Heart, Minus, Plus, Loader2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { useAddToCart } from '@/features/cart/hooks/use-cart';
import { useWishlist, useAddToWishlist, useRemoveFromWishlist } from '@/features/wishlist/hooks/use-wishlist';
import { useAuth } from '@/hooks/use-auth';
import { useProductReviewSummary } from '@/features/reviews/hooks/use-reviews';
import { ProductReviewsSection } from '@/features/reviews/components/product-reviews-section';
import { useRecentlyViewed } from '@/features/products/hooks/use-recently-viewed';
import { RecentlyViewedSection } from '@/components/storefront/recently-viewed-section';
import { Breadcrumbs } from '@/components/shared/breadcrumbs';
import { SectionErrorBoundary } from '@/components/shared/section-error-boundary';

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { user, requireAuth } = useAuth();
  const { data: product, isLoading, isError } = useProduct(resolvedParams.id);
  const { data: reviewSummary } = useProductReviewSummary(product?.id || '');
  const { addProduct } = useRecentlyViewed();
  
  useEffect(() => {
    if (product) {
      addProduct(product);
    }
  }, [product, addProduct]);
  
  const addToCartMutation = useAddToCart();
  const { data: wishlist } = useWishlist();
  const addToWishlistMutation = useAddToWishlist();
  const removeFromWishlistMutation = useRemoveFromWishlist();
  
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  if (isLoading) {
    return (
      <div className="container py-12 flex flex-col lg:flex-row gap-12 max-w-7xl mx-auto">
        <div className="w-full lg:w-1/2 aspect-square">
          <Skeleton className="w-full h-full rounded-3xl" />
        </div>
        <div className="w-full lg:w-1/2 space-y-6 pt-8">
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-6 w-1/4" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-14 w-1/2" />
        </div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="container py-32 text-center flex flex-col items-center justify-center">
        <div className="bg-muted p-6 rounded-full mb-6">
          <Package className="h-16 w-16 text-muted-foreground" />
        </div>
        <h1 className="text-3xl font-bold mb-4">Product not found</h1>
        <p className="text-lg text-muted-foreground mb-8 max-w-md">The product you&apos;re looking for doesn&apos;t exist or has been removed from our catalog.</p>
        <Link href="/products" className={buttonVariants({ size: "lg", className: "rounded-full px-8" })}>
          Back to Catalog
        </Link>
      </div>
    );
  }

  // Find selected variant
  const selectedVariant = selectedVariantId 
    ? product.variants.find(v => v.id === selectedVariantId) 
    : product.variants[0];

  // Set default variant if not selected
  if (!selectedVariantId && selectedVariant) {
    setSelectedVariantId(selectedVariant.id);
  }

  // Calculate final price
  const basePrice = parseFloat(product.basePrice);
  const priceModifier = selectedVariant ? parseFloat(selectedVariant.priceModifier) : 0;
  const finalPrice = basePrice + priceModifier;

  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(finalPrice);

  // Stock calculations
  const inventory = selectedVariant?.inventory;
  const availableStock = inventory ? inventory.quantity - inventory.reservedQuantity : 0;
  const isOutOfStock = availableStock <= 0;
  
  const handleAddToCart = () => {
    if (!selectedVariantId) return;

    requireAuth(
      () => {
        addToCartMutation.mutate({ productVariantId: selectedVariantId, quantity });
      },
      {
        pendingAction: 'ADD_TO_CART',
        payload: {
          productVariantId: selectedVariantId,
          quantity,
          title: product.title,
        },
        returnUrl: `/products/${product.slug}`,
        message: 'Please sign in to add items to your cart',
      }
    );
  };

  const isInWishlist = wishlist?.items?.some(item => item.productId === product.id) ?? false;

  const handleToggleWishlist = () => {
    requireAuth(
      () => {
        if (isInWishlist) {
          removeFromWishlistMutation.mutate(product.id);
        } else {
          addToWishlistMutation.mutate(product.id);
        }
      },
      {
        message: 'Sign in to save items to your wishlist',
        returnUrl: `/products/${product.slug}`,
      }
    );
  };

  // Group attributes for VariantSelector
  const attributesMap = new Map<string, Set<string>>();
  product.variants.forEach(variant => {
    Object.entries(variant.attributes).forEach(([key, val]) => {
      if (!attributesMap.has(key)) attributesMap.set(key, new Set());
      attributesMap.get(key)!.add(val as string);
    });
  });

  const breadcrumbItems = [
    { label: 'Products', href: '/products' },
    ...(product.category ? [{ label: product.category.name, href: `/products?category=${product.category.slug}` }] : []),
    { label: product.title },
  ];

  // Structured Data (JSON-LD) for SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description,
    image: product.images?.map(i => i.url) || [],
    offers: {
      '@type': 'Offer',
      price: finalPrice,
      priceCurrency: 'USD',
      availability: isOutOfStock ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock',
    },
    ...(reviewSummary && reviewSummary.reviewCount > 0 ? {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: reviewSummary.averageRating,
        reviewCount: reviewSummary.reviewCount,
      },
    } : {}),
  };

  return (
    <div className="container py-8 md:py-12">
      {/* JSON-LD for Search Engines */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumbs */}
      <Breadcrumbs items={breadcrumbItems} className="mb-8 md:mb-12" />

      <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 max-w-7xl mx-auto">
        
        {/* Left: Image Gallery */}
        <div className="w-full lg:w-1/2 flex flex-col gap-4">
          <div className="relative aspect-square w-full bg-secondary/30 rounded-3xl overflow-hidden border border-border/50 flex items-center justify-center shadow-sm">
            {product.images && product.images.length > 0 ? (
              <img 
                src={product.images[0].url} 
                alt={product.title} 
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-muted-foreground/30">
                <Package className="h-24 w-24 mb-4" strokeWidth={1} />
                <span className="text-2xl font-bold tracking-widest uppercase">{product.title.substring(0, 2)}</span>
              </div>
            )}
            
            {isOutOfStock && (
              <div className="absolute top-6 left-6">
                <Badge variant="destructive" className="text-sm shadow-md px-4 py-1.5 font-semibold">Out of Stock</Badge>
              </div>
            )}
          </div>
          
          {/* Thumbnails */}
          {product.images && product.images.length > 1 && (
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
              {product.images.map(image => (
                <button
                  key={image.id}
                  aria-label="View product image thumbnail"
                  className="h-24 w-24 flex-shrink-0 rounded-2xl border-2 border-transparent bg-secondary/30 hover:border-primary/50 overflow-hidden focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all opacity-80 hover:opacity-100"
                >
                  <img src={image.url} alt="Thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Info */}
        <div className="w-full lg:w-1/2 flex flex-col pt-2 lg:pt-8">
          {product.brand && (
            <Link href={`/products?brand=${product.brand.slug}`} className="inline-block text-sm font-extrabold uppercase tracking-widest text-primary hover:text-primary/80 mb-3 transition-colors">
              {product.brand.name}
            </Link>
          )}
          
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-4 text-foreground leading-[1.1]">
            {product.title}
          </h1>
          
          {/* Rating Summary Badge */}
          <div className="flex items-center gap-3 mb-8">
            <div className="flex items-center bg-amber-400/10 px-2.5 py-1 rounded-full text-amber-600 dark:text-amber-400 border border-amber-400/20">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400 mr-1" />
              <span className="text-sm font-bold">
                {reviewSummary && reviewSummary.reviewCount > 0
                  ? reviewSummary.averageRating.toFixed(1)
                  : 'New'}
              </span>
            </div>
            <a
              href="#reviews"
              className="text-sm text-muted-foreground font-medium underline decoration-muted-foreground/30 underline-offset-4 hover:text-foreground transition-colors"
            >
              {reviewSummary && reviewSummary.reviewCount > 0
                ? `${reviewSummary.reviewCount} ${reviewSummary.reviewCount === 1 ? 'review' : 'reviews'}`
                : 'No reviews yet'}
            </a>
          </div>

          <div className="text-4xl font-extrabold text-foreground mb-8 flex items-end gap-2">
            {formattedPrice}
            {isOutOfStock && <span className="text-lg text-destructive font-semibold mb-1 ml-2">Unavailable</span>}
          </div>

          <div className="prose prose-sm sm:prose-base dark:prose-invert mb-10 text-muted-foreground/90 font-medium leading-relaxed">
            <p>{product.description}</p>
          </div>

          {/* Variants */}
          {attributesMap.size > 0 && (
            <div className="space-y-6 mb-10 bg-secondary/20 p-6 rounded-2xl border border-border/40">
              {Array.from(attributesMap.entries()).map(([key, values]) => (
                <div key={key}>
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-sm font-bold capitalize text-foreground">{key}</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {Array.from(values).map(val => {
                      const isSelected = selectedVariant?.attributes[key] === val;
                      return (
                        <Button 
                          key={val} 
                          variant={isSelected ? 'default' : 'outline'}
                          className={`rounded-full px-6 font-semibold transition-all ${isSelected ? 'shadow-md' : 'bg-background hover:border-primary/50'}`}
                          onClick={() => {
                            const newSelection = { ...selectedVariant?.attributes, [key]: val };
                            const matchingVariant = product.variants.find(variant => 
                              Object.entries(newSelection).every(([attrKey, attrValue]) => variant.attributes[attrKey] === attrValue)
                            );
                            if (matchingVariant) {
                              setSelectedVariantId(matchingVariant.id);
                            }
                          }}
                        >
                          {val}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Actions Container */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-8">
            
            {/* Quantity Selector */}
            <div className="flex items-center border border-border/60 rounded-full h-14 bg-background shadow-sm w-full sm:w-36 shrink-0 overflow-hidden">
              <Button 
                variant="ghost" 
                size="icon" 
                aria-label="Decrease quantity"
                className="h-full w-12 rounded-none hover:bg-muted text-muted-foreground hover:text-foreground shrink-0"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={isOutOfStock || quantity <= 1}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <div className="flex-1 text-center font-bold text-lg">{quantity}</div>
              <Button 
                variant="ghost" 
                size="icon" 
                aria-label="Increase quantity"
                className="h-full w-12 rounded-none hover:bg-muted text-muted-foreground hover:text-foreground shrink-0"
                onClick={() => setQuantity(Math.min(availableStock, quantity + 1))}
                disabled={isOutOfStock || quantity >= availableStock}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Add to Cart */}
            <Button 
              size="lg" 
              className="flex-1 h-14 text-base font-bold shadow-lg transition-all active:scale-95 hover:shadow-xl rounded-full" 
              disabled={isOutOfStock || addToCartMutation.isPending}
              onClick={handleAddToCart}
            >
              {addToCartMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Adding to Cart...
                </>
              ) : (
                <>
                  <ShoppingBag className="mr-2 h-5 w-5" />
                  {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                </>
              )}
            </Button>
            
            {/* Wishlist */}
            <Button
              variant={isInWishlist ? 'secondary' : 'outline'}
              size="icon"
              aria-label={isInWishlist ? 'Remove from wishlist' : 'Save to wishlist'}
              className={`h-14 w-14 rounded-full shrink-0 shadow-sm border-border/60 transition-all ${isInWishlist ? 'bg-primary/10 border-primary/20 text-primary' : 'hover:border-primary/50 text-muted-foreground'}`}
              onClick={handleToggleWishlist}
              disabled={addToWishlistMutation.isPending || removeFromWishlistMutation.isPending}
            >
              {addToWishlistMutation.isPending || removeFromWishlistMutation.isPending ? (
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              ) : (
                <Heart className={`h-6 w-6 ${isInWishlist ? 'fill-primary text-primary' : ''}`} />
              )}
            </Button>
          </div>

          {/* Stock Indicator */}
          <div className="flex items-center gap-2 text-sm font-medium mb-10">
            {isOutOfStock ? (
              <>
                <div className="w-2.5 h-2.5 rounded-full bg-destructive animate-pulse" />
                <span className="text-destructive">Currently unavailable</span>
              </>
            ) : (
              <>
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-muted-foreground"><strong className="text-foreground">{availableStock}</strong> items left in stock</span>
              </>
            )}
          </div>

          <Separator className="mb-8" />

          {/* Features Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm font-medium">
            <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-secondary/30 border border-border/40 text-center gap-2">
              <Shield className="h-6 w-6 text-primary mb-1" />
              <span className="text-foreground">1 Year Warranty</span>
              <span className="text-muted-foreground text-xs font-normal">Full coverage included</span>
            </div>
            <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-secondary/30 border border-border/40 text-center gap-2">
              <Truck className="h-6 w-6 text-primary mb-1" />
              <span className="text-foreground">Free Shipping</span>
              <span className="text-muted-foreground text-xs font-normal">On orders over $50</span>
            </div>
            <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-secondary/30 border border-border/40 text-center gap-2">
              <RefreshCw className="h-6 w-6 text-primary mb-1" />
              <span className="text-foreground">30 Day Returns</span>
              <span className="text-muted-foreground text-xs font-normal">No questions asked</span>
            </div>
          </div>
        </div>
      </div>

      {/* Product Reviews & Ratings Section */}
      <SectionErrorBoundary fallbackTitle="Reviews unavailable">
        <ProductReviewsSection productId={product.id} productTitle={product.title} />
      </SectionErrorBoundary>

      {/* Recently Viewed Products */}
      <SectionErrorBoundary fallbackTitle="Recently viewed items unavailable">
        <RecentlyViewedSection currentProductId={product.id} />
      </SectionErrorBoundary>
    </div>
  );
}
