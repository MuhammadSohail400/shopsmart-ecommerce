"use client";

import { useState, use } from 'react';
import { useProduct } from '@/hooks/use-catalog';
import { Skeleton } from '@/components/ui/skeleton';
import { Button, buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingBag, Star, Package, ChevronRight, Home, Shield, Truck, RefreshCw, Heart } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { useAddToCart } from '@/features/cart/hooks/use-cart';
import { useWishlist, useAddToWishlist, useRemoveFromWishlist } from '@/features/wishlist/hooks/use-wishlist';
import { useCurrentUser } from '@/hooks/use-auth';

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { data: user } = useCurrentUser();
  const { data: product, isLoading, isError } = useProduct(resolvedParams.id);
  
  const addToCartMutation = useAddToCart();
  const { data: wishlist } = useWishlist();
  const addToWishlistMutation = useAddToWishlist();
  const removeFromWishlistMutation = useRemoveFromWishlist();
  
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  if (isLoading) {
    return (
      <div className="container py-8 flex flex-col md:flex-row gap-12">
        <div className="w-full md:w-1/2 aspect-[4/5] max-w-lg mx-auto md:mx-0">
          <Skeleton className="w-full h-full rounded-2xl" />
        </div>
        <div className="w-full md:w-1/2 space-y-6">
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-6 w-1/4" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-12 w-1/3" />
        </div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="container py-20 text-center flex flex-col items-center justify-center">
        <Package className="h-16 w-16 text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold mb-2">Product not found</h1>
        <p className="text-muted-foreground mb-6">The product you&apos;re looking for doesn&apos;t exist or has been removed.</p>
        <Link href="/products" className={buttonVariants()}>
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
    addToCartMutation.mutate({ productVariantId: selectedVariantId, quantity });
  };

  const isInWishlist = wishlist?.items?.some(item => item.productId === product.id) ?? false;

  const handleToggleWishlist = () => {
    if (!user) return;
    if (isInWishlist) {
      removeFromWishlistMutation.mutate(product.id);
    } else {
      addToWishlistMutation.mutate(product.id);
    }
  };

  // Group attributes for VariantSelector
  const attributesMap = new Map<string, Set<string>>();
  product.variants.forEach(variant => {
    Object.entries(variant.attributes).forEach(([key, val]) => {
      if (!attributesMap.has(key)) attributesMap.set(key, new Set());
      attributesMap.get(key)!.add(val as string);
    });
  });

  return (
    <div className="container py-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center text-sm text-muted-foreground mb-8">
        <Link href="/" className="hover:text-foreground flex items-center">
          <Home className="h-4 w-4" />
        </Link>
        <ChevronRight className="h-4 w-4 mx-2" />
        <Link href="/products" className="hover:text-foreground">Products</Link>
        {product.category && (
          <>
            <ChevronRight className="h-4 w-4 mx-2" />
            <Link href={`/products?category=${product.category.slug}`} className="hover:text-foreground">
              {product.category.name}
            </Link>
          </>
        )}
        <ChevronRight className="h-4 w-4 mx-2" />
        <span className="text-foreground font-medium truncate max-w-[200px]">{product.title}</span>
      </nav>

      <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
        {/* Images Gallery */}
        <div className="w-full lg:w-1/2 flex flex-col gap-4 max-w-xl mx-auto lg:mx-0">
          <div className="aspect-[4/5] w-full rounded-2xl overflow-hidden bg-muted border relative flex items-center justify-center">
            {product.images && product.images.length > 0 ? (
              <img 
                src={product.images[0].url} 
                alt={product.title} 
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-muted-foreground/30">
                <Package className="h-24 w-24 mb-4" strokeWidth={1} />
                <span className="text-xl font-medium tracking-widest uppercase">{product.title.substring(0, 2)}</span>
              </div>
            )}
            
            {isOutOfStock && (
              <div className="absolute top-4 left-4">
                <Badge variant="destructive" className="text-sm shadow-md">Out of Stock</Badge>
              </div>
            )}
          </div>
          
          {/* Thumbnails */}
          {product.images && product.images.length > 1 && (
            <div className="flex gap-4 overflow-x-auto pb-2">
              {product.images.map(image => (
                <button key={image.id} className="h-20 w-20 flex-shrink-0 rounded-md border-2 border-transparent hover:border-primary overflow-hidden focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
                  <img src={image.url} alt="Thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="w-full lg:w-1/2 flex flex-col">
          {product.brand && (
            <Link href={`/products?brand=${product.brand.slug}`} className="text-sm font-semibold uppercase tracking-wider text-muted-foreground hover:text-primary mb-2">
              {product.brand.name}
            </Link>
          )}
          
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2 text-foreground">
            {product.title}
          </h1>
          
          {/* Reviews Mock */}
          <div className="flex items-center gap-2 mb-6">
            <div className="flex text-yellow-500">
              {[1, 2, 3, 4, 5].map(i => (
                <Star key={i} className="h-4 w-4 fill-current" />
              ))}
            </div>
            <span className="text-sm text-muted-foreground">(128 reviews)</span>
          </div>

          <div className="text-3xl font-bold text-primary mb-6">
            {formattedPrice}
          </div>

          <div className="prose prose-sm sm:prose-base dark:prose-invert mb-8 text-muted-foreground line-clamp-3 hover:line-clamp-none transition-all">
            <p>{product.description}</p>
          </div>

          <Separator className="mb-6" />

          {/* Variants */}
          {attributesMap.size > 0 && (
            <div className="space-y-6 mb-8">
              {Array.from(attributesMap.entries()).map(([key, values]) => (
                <div key={key}>
                  <h3 className="text-sm font-medium mb-3 capitalize">{key}</h3>
                  <div className="flex flex-wrap gap-2">
                    {Array.from(values).map(val => {
                      // Find if a variant with this value exists and is selected
                      const isSelected = selectedVariant?.attributes[key] === val;
                      
                      return (
                        <Button 
                          key={val} 
                          variant={isSelected ? 'default' : 'outline'}
                          onClick={() => {
                            // Find the first variant that matches this new attribute selection
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

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="flex items-center border rounded-md h-12">
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-none h-full"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={isOutOfStock || quantity <= 1}
              >
                -
              </Button>
              <div className="w-12 text-center font-medium">{quantity}</div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-none h-full"
                onClick={() => setQuantity(Math.min(availableStock, quantity + 1))}
                disabled={isOutOfStock || quantity >= availableStock}
              >
                +
              </Button>
            </div>
            <Button 
              size="lg" 
              className="flex-1 h-12 text-lg shadow-lg transition-transform active:scale-95" 
              disabled={isOutOfStock || addToCartMutation.isPending}
              onClick={handleAddToCart}
            >
              <ShoppingBag className="mr-2 h-5 w-5" />
              {addToCartMutation.isPending ? 'Adding...' : isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
            </Button>
            {user && (
              <Button
                variant={isInWishlist ? 'secondary' : 'outline'}
                size="icon"
                className="h-12 w-12"
                onClick={handleToggleWishlist}
                disabled={addToWishlistMutation.isPending || removeFromWishlistMutation.isPending}
              >
                <Heart className={`h-5 w-5 ${isInWishlist ? 'fill-primary text-primary' : ''}`} />
              </Button>
            )}
          </div>

          <p className="text-sm text-muted-foreground mb-8">
            {isOutOfStock ? (
              <span className="text-destructive font-medium">Currently unavailable.</span>
            ) : (
              <span><strong className="text-foreground">{availableStock}</strong> items left in stock</span>
            )}
          </p>

          <Separator className="mb-6" />

          {/* Features */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-primary" />
              <span>1 Year Warranty</span>
            </div>
            <div className="flex items-center gap-3">
              <Truck className="h-5 w-5 text-primary" />
              <span>Free Shipping over $50</span>
            </div>
            <div className="flex items-center gap-3">
              <RefreshCw className="h-5 w-5 text-primary" />
              <span>30 Day Returns</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
