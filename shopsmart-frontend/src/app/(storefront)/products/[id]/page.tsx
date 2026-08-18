"use client";

import { useState, useEffect, use } from 'react';
import { useProduct } from '@/hooks/use-catalog';
import { Skeleton } from '@/components/ui/skeleton';
import { Button, buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingBag, Star, Package, ShieldCheck, Truck, RefreshCw, Heart, Minus, Plus, Loader2, Check, ArrowRight, Ruler } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAddToCart } from '@/features/cart/hooks/use-cart';
import { useWishlist, useAddToWishlist, useRemoveFromWishlist } from '@/features/wishlist/hooks/use-wishlist';
import { useAuth } from '@/hooks/use-auth';
import { useProductReviewSummary } from '@/features/reviews/hooks/use-reviews';
import { ProductReviewsSection } from '@/features/reviews/components/product-reviews-section';
import { useRecentlyViewed } from '@/features/products/hooks/use-recently-viewed';
import { RecentlyViewedSection } from '@/components/storefront/recently-viewed-section';
import { Breadcrumbs } from '@/components/shared/breadcrumbs';
import { SectionErrorBoundary } from '@/components/shared/section-error-boundary';
import { formatCurrency, getDiscountDetails } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
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
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="container py-8 sm:py-12 flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="w-full lg:w-1/2 aspect-[4/5]">
          <Skeleton className="w-full h-full rounded-3xl" />
        </div>
        <div className="w-full lg:w-1/2 space-y-5 pt-4">
          <Skeleton className="h-6 w-1/4" />
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-12 w-1/2" />
        </div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="container py-24 text-center flex flex-col items-center justify-center px-4">
        <div className="bg-muted p-6 rounded-full mb-6">
          <Package className="h-16 w-16 text-muted-foreground" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold mb-3">Product not found</h1>
        <p className="text-sm text-muted-foreground mb-6 max-w-md">The product you&apos;re looking for doesn&apos;t exist or has been updated in our catalog.</p>
        <Link href="/products" className={buttonVariants({ size: "lg", className: "rounded-full px-8" })}>
          Explore Fashion Catalog
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

  // Calculate final price and discount
  const basePrice = parseFloat(product.basePrice);
  const priceModifier = selectedVariant ? parseFloat(selectedVariant.priceModifier || '0') : 0;
  const finalPrice = basePrice + priceModifier;

  const discount = getDiscountDetails(finalPrice, product.slug);

  // Stock calculations
  const inventory = selectedVariant?.inventory;
  const availableStock = inventory ? inventory.quantity - inventory.reservedQuantity : 0;
  const isOutOfStock = availableStock <= 0;
  
  const handleAddToCart = () => {
    if (!selectedVariantId) return;

    requireAuth(
      () => {
        addToCartMutation.mutate({
          productVariantId: selectedVariantId,
          quantity,
        });
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

  const handleBuyNow = () => {
    if (!selectedVariantId) return;

    requireAuth(
      () => {
        addToCartMutation.mutate(
          {
            productVariantId: selectedVariantId,
            quantity,
          },
          {
            onSuccess: () => {
              router.push('/checkout');
            },
          }
        );
      },
      {
        pendingAction: 'ADD_TO_CART',
        payload: {
          productVariantId: selectedVariantId,
          quantity,
          title: product.title,
        },
        returnUrl: '/checkout',
        message: 'Please sign in to proceed directly to checkout',
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

  const images = product.images && product.images.length > 0 ? product.images : [];
  const activeImage = images[activeImageIndex]?.url;

  const jsonLd = product ? {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description,
    image: product.images?.map((img) => img.url) || [],
    brand: {
      '@type': 'Brand',
      name: product.brand?.name || 'ShopSmart',
    },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'PKR',
      price: product.basePrice,
      availability: !isOutOfStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      url: `https://shopsmart-ecommerce-store.netlify.app/products/${product.id}`,
      seller: {
        '@type': 'Organization',
        name: 'ShopSmart',
      },
    },
    ...(reviewSummary && reviewSummary.reviewCount > 0 ? {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: reviewSummary.averageRating,
        reviewCount: reviewSummary.reviewCount,
        bestRating: 5,
        worstRating: 1,
      }
    } : {}),
  } : null;

  return (
    <div className="container max-w-7xl mx-auto py-6 sm:py-10 px-4 sm:px-6 space-y-12">
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      {/* Breadcrumbs */}
      <Breadcrumbs items={[
        { label: 'Home', href: '/' },
        { label: 'Fashion Catalog', href: '/products' },
        ...(product.category ? [{ label: product.category.name, href: `/products?category=${product.category.slug}` }] : []),
        { label: product.title, href: `/products/${product.slug}` },
      ]} />

      {/* Main Product Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        
        {/* Left Column: Image Gallery (4:5 Ratio) */}
        <div className="lg:col-span-6 flex flex-col gap-4">
          <div className="relative aspect-[4/5] w-full rounded-3xl overflow-hidden bg-secondary/30 border border-border/50 shadow-md flex items-center justify-center">
            {activeImage ? (
              <img
                src={activeImage}
                alt={product.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-muted-foreground/30 flex flex-col items-center">
                <Package className="h-20 w-20" strokeWidth={1} />
              </div>
            )}

            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
              {discount.isSale && (
                <Badge className="bg-rose-600 text-white font-black text-xs px-3 py-1 shadow-md border-none">
                  -{discount.discountPercent}% OFF
                </Badge>
              )}
              {isOutOfStock && (
                <Badge variant="destructive" className="font-bold text-xs px-3 py-1 shadow-md">
                  Out of Stock
                </Badge>
              )}
            </div>

            {/* Wishlist Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleToggleWishlist}
              disabled={addToWishlistMutation.isPending || removeFromWishlistMutation.isPending}
              className="absolute top-4 right-4 h-10 w-10 rounded-full bg-background/90 backdrop-blur-md shadow-md hover:bg-background transition-all"
            >
              <Heart className={`h-5 w-5 ${isInWishlist ? 'fill-primary text-primary' : 'text-muted-foreground'}`} />
            </Button>
          </div>

          {/* Thumbnail Gallery */}
          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {images.map((img, index) => (
                <button
                  key={img.id || index}
                  onClick={() => setActiveImageIndex(index)}
                  className={`relative aspect-[4/5] w-20 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                    activeImageIndex === index
                      ? 'border-primary ring-2 ring-primary/20 shadow-xs'
                      : 'border-border/60 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Product Info & Purchase Options */}
        <div className="lg:col-span-6 space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-widest text-primary">
                {product.brand?.name || 'ShopSmart'}
              </span>
              {product.category && (
                <>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-xs font-semibold text-muted-foreground">{product.category.name}</span>
                </>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-foreground leading-tight">
              {product.title}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-2 pt-1">
              <div className="flex items-center text-amber-500">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-amber-500" />
                ))}
              </div>
              <span className="text-xs font-bold text-foreground">
                {reviewSummary?.averageRating ? Number(reviewSummary.averageRating).toFixed(1) : '4.9'}
              </span>
              <span className="text-xs text-muted-foreground">
                ({reviewSummary?.reviewCount ?? 24} customer reviews)
              </span>
            </div>
          </div>

          {/* Pricing & Availability */}
          <div className="p-4 rounded-2xl bg-secondary/30 border border-border/50 flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-black text-foreground">{discount.formattedCurrent}</span>
                {discount.isSale && (
                  <span className="text-base text-muted-foreground line-through font-bold">{discount.formattedOriginal}</span>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground font-semibold">Inclusive of all local taxes</p>
            </div>

            <div>
              {isOutOfStock ? (
                <Badge variant="destructive" className="font-bold text-xs px-3 py-1">Out of Stock</Badge>
              ) : availableStock <= 5 ? (
                <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20 font-bold text-xs px-3 py-1">
                  Only {availableStock} left in stock
                </Badge>
              ) : (
                <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 font-bold text-xs px-3 py-1">
                  In Stock
                </Badge>
              )}
            </div>
          </div>

          {/* Variants / Size Selector */}
          {product.variants.length > 1 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-foreground">
                  Select Size / Option
                </span>
                
                {/* Size Guide Trigger */}
                <Dialog open={isSizeGuideOpen} onOpenChange={setIsSizeGuideOpen}>
                  <DialogTrigger className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline">
                    <Ruler className="h-3.5 w-3.5" /> Size Guide
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md rounded-2xl">
                    <DialogHeader>
                      <DialogTitle className="text-lg font-black">Standard Size Chart (Inches)</DialogTitle>
                    </DialogHeader>
                    <div className="mt-2 text-xs space-y-2">
                      <div className="grid grid-cols-4 p-2 bg-secondary/50 rounded-lg font-bold">
                        <span>Size</span>
                        <span>Chest</span>
                        <span>Length</span>
                        <span>Sleeve</span>
                      </div>
                      <div className="grid grid-cols-4 p-2 border-b">
                        <span>S (38)</span>
                        <span>38-40&quot;</span>
                        <span>28.5&quot;</span>
                        <span>24.5&quot;</span>
                      </div>
                      <div className="grid grid-cols-4 p-2 border-b">
                        <span>M (40)</span>
                        <span>40-42&quot;</span>
                        <span>29.5&quot;</span>
                        <span>25.0&quot;</span>
                      </div>
                      <div className="grid grid-cols-4 p-2 border-b">
                        <span>L (42)</span>
                        <span>42-44&quot;</span>
                        <span>30.5&quot;</span>
                        <span>25.5&quot;</span>
                      </div>
                      <div className="grid grid-cols-4 p-2">
                        <span>XL (44)</span>
                        <span>44-46&quot;</span>
                        <span>31.5&quot;</span>
                        <span>26.0&quot;</span>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="flex flex-wrap gap-2">
                {product.variants.map((v) => {
                  const label = v.attributes && Object.keys(v.attributes).length > 0
                    ? Object.values(v.attributes).join(' • ')
                    : v.sku;
                  const isSelected = selectedVariantId === v.id;
                  const vStock = (v.inventory?.quantity ?? 0) - (v.inventory?.reservedQuantity ?? 0);
                  const isVOutOfStock = vStock <= 0;

                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setSelectedVariantId(v.id)}
                      disabled={isVOutOfStock}
                      className={`h-10 px-4 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                        isSelected
                          ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                          : isVOutOfStock
                          ? 'opacity-40 line-through border-dashed cursor-not-allowed bg-secondary/30'
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

          {/* Quantity and Actions */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3">
              <div className="flex items-center border border-border/80 rounded-full bg-background h-11 shadow-xs overflow-hidden">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-full rounded-none w-10 text-muted-foreground hover:text-foreground"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-10 text-center text-xs font-black">{quantity}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-full rounded-none w-10 text-muted-foreground hover:text-foreground"
                  onClick={() => setQuantity((q) => q + 1)}
                  disabled={isOutOfStock || quantity >= availableStock}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <Button
                size="lg"
                className="flex-1 h-11 rounded-full font-extrabold shadow-md gap-2 text-xs sm:text-sm"
                disabled={isOutOfStock || addToCartMutation.isPending}
                onClick={handleAddToCart}
              >
                {addToCartMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ShoppingBag className="h-4 w-4" />
                )}
                Add to Cart
              </Button>
            </div>

            <Button
              variant="secondary"
              size="lg"
              className="w-full h-11 rounded-full font-extrabold text-xs sm:text-sm border border-border/80 hover:bg-primary/10 hover:text-primary transition-colors"
              disabled={isOutOfStock || addToCartMutation.isPending}
              onClick={handleBuyNow}
            >
              Buy It Now
            </Button>
          </div>

          {/* Value Props & Assurance Strip */}
          <div className="grid grid-cols-3 gap-2.5 pt-4 border-t border-border/40 text-center">
            <div className="p-3 rounded-xl bg-secondary/30 border border-border/30">
              <Truck className="h-4 w-4 text-primary mx-auto mb-1" />
              <span className="text-[10px] font-bold text-foreground block">Free Delivery</span>
              <span className="text-[9px] text-muted-foreground">Orders over Rs. 2,500</span>
            </div>
            <div className="p-3 rounded-xl bg-secondary/30 border border-border/30">
              <RefreshCw className="h-4 w-4 text-primary mx-auto mb-1" />
              <span className="text-[10px] font-bold text-foreground block">30-Day Returns</span>
              <span className="text-[9px] text-muted-foreground">Hassle-free exchange</span>
            </div>
            <div className="p-3 rounded-xl bg-secondary/30 border border-border/30">
              <ShieldCheck className="h-4 w-4 text-primary mx-auto mb-1" />
              <span className="text-[10px] font-bold text-foreground block">100% Authentic</span>
              <span className="text-[9px] text-muted-foreground">Direct from brand</span>
            </div>
          </div>

          {/* Product Description */}
          {product.description && (
            <div className="pt-4 border-t border-border/40 space-y-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-foreground">
                Product Description & Fabric Care
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {product.description}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Reviews Section */}
      <SectionErrorBoundary fallbackTitle="Customer reviews unavailable">
        <ProductReviewsSection productId={product.id} />
      </SectionErrorBoundary>

      {/* Recently Viewed */}
      <SectionErrorBoundary fallbackTitle="Recently viewed items unavailable">
        <RecentlyViewedSection />
      </SectionErrorBoundary>
    </div>
  );
}
