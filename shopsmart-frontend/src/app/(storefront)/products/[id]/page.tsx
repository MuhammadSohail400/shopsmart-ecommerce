"use client";

import { useState, useEffect, use } from 'react';
import { useProduct, useProducts } from '@/hooks/use-catalog';
import { Skeleton } from '@/components/ui/skeleton';
import { Button, buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ShoppingBag, Star, Package, ShieldCheck, Truck, RefreshCw, 
  Heart, Minus, Plus, Loader2, Check, ArrowRight, Ruler, 
  ChevronDown, ChevronUp, MessageCircle, Scissors, Sparkles, Zap
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAddToCart } from '@/features/cart/hooks/use-cart';
import { useWishlist, useAddToWishlist, useRemoveFromWishlist } from '@/features/wishlist/hooks/use-wishlist';
import { useAuth } from '@/hooks/use-auth';
import { useProductReviewSummary } from '@/features/reviews/hooks/use-reviews';
import { ProductReviewsSection } from '@/features/reviews/components/product-reviews-section';
import { useRecentlyViewed } from '@/features/products/hooks/use-recently-viewed';
import { ProductCard } from '@/components/storefront/product-card';
import { Breadcrumbs } from '@/components/shared/breadcrumbs';
import { SectionErrorBoundary } from '@/components/shared/section-error-boundary';
import { formatCurrency, getDiscountDetails, formatWhatsAppUrl } from '@/lib/utils';
import { usePublicSettings } from '@/hooks/use-admin';
import { WhatsAppOrderDialog } from '@/components/storefront/whatsapp-order-dialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

const SIZE_GUIDE_DATA = [
  { size: 'S', chest: '38 in / 96 cm', length: '28 in / 71 cm', shoulder: '18.5 in / 47 cm' },
  { size: 'M', chest: '40 in / 102 cm', length: '29 in / 74 cm', shoulder: '19.5 in / 49 cm' },
  { size: 'L', chest: '42 in / 107 cm', length: '30 in / 76 cm', shoulder: '20.5 in / 52 cm' },
  { size: 'XL', chest: '44 in / 112 cm', length: '31 in / 79 cm', shoulder: '21.5 in / 55 cm' },
  { size: 'XXL', chest: '46 in / 117 cm', length: '32 in / 81 cm', shoulder: '22.5 in / 57 cm' },
];

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { user, requireAuth } = useAuth();
  const { data: publicSettings } = usePublicSettings();
  const { data: product, isLoading, isError } = useProduct(resolvedParams.id);
  const { data: reviewSummary } = useProductReviewSummary(product?.id || '');
  const { data: relatedProductsData } = useProducts({ limit: 4 });
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

  // Accordion open states
  const [openAccordions, setOpenAccordions] = useState<{ [key: string]: boolean }>({
    details: true,
    sizeGuide: false,
    shipping: false,
    care: false,
  });

  const toggleAccordion = (key: string) => {
    setOpenAccordions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100">
        <div className="container py-8 sm:py-12 flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto px-4 sm:px-6">
          <div className="w-full lg:w-1/2 aspect-[4/5] bg-zinc-900 rounded-md animate-pulse" />
          <div className="w-full lg:w-1/2 space-y-5 pt-4">
            <Skeleton className="h-4 w-1/4 bg-zinc-800" />
            <Skeleton className="h-10 w-3/4 bg-zinc-800" />
            <Skeleton className="h-8 w-1/3 bg-zinc-800" />
            <Skeleton className="h-28 w-full bg-zinc-800" />
            <Skeleton className="h-12 w-full bg-zinc-800" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 container py-24 text-center flex flex-col items-center justify-center px-4">
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-full mb-6">
          <Package className="h-16 w-16 text-zinc-500" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black font-mono uppercase mb-3">PIECE NOT FOUND</h1>
        <p className="text-sm text-zinc-400 mb-6 max-w-md">The piece you&apos;re looking for doesn&apos;t exist or has dropped out of our collection.</p>
        <Link href="/products" className={buttonVariants({ size: "lg", className: "bg-rose-600 hover:bg-rose-700 text-white font-mono font-bold text-xs uppercase px-8 rounded" })}>
          EXPLORE ASORA COLLECTION
        </Link>
      </div>
    );
  }

  // Find selected variant
  const selectedVariant = selectedVariantId 
    ? product.variants.find(v => v.id === selectedVariantId) 
    : product.variants[0];

  if (!selectedVariantId && selectedVariant) {
    setSelectedVariantId(selectedVariant.id);
  }

  // Price calculation
  const basePrice = parseFloat(product.basePrice);
  const priceModifier = selectedVariant ? parseFloat(selectedVariant.priceModifier || '0') : 0;
  const finalPrice = basePrice + priceModifier;
  const discount = getDiscountDetails(finalPrice, product.slug);

  // Stock status
  const inventory = selectedVariant?.inventory;
  const availableStock = inventory ? inventory.quantity - inventory.reservedQuantity : 0;
  const isOutOfStock = availableStock <= 0;

  // Selected size from variant attributes
  const selectedSize = (selectedVariant?.attributes as any)?.size || 'L';
  const selectedColor = (selectedVariant?.attributes as any)?.color || 'Black';

  // Wishlist state
  const isWishlisted = wishlist?.items?.some((item: any) => item.productId === product.id) ?? false;
  const toggleWishlist = () => {
    if (isWishlisted) {
      removeFromWishlistMutation.mutate(product.id);
    } else {
      addToWishlistMutation.mutate(product.id);
    }
  };

  const handleAddToCart = () => {
    if (!selectedVariantId) return;

    addToCartMutation.mutate({
      productVariantId: selectedVariantId,
      quantity,
    });
  };

  const handleBuyNow = () => {
    if (!selectedVariantId) return;

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
  };

  // WhatsApp Order Link (Driven dynamically by Admin Settings)
  const activeWhatsApp = publicSettings?.whatsapp_number || publicSettings?.support_phone || '03110297772';
  const whatsappMessage = 
    `Hi ASORA! I would like to order:\n` +
    `Piece: ${product.title}\n` +
    `Size: ${selectedSize}\n` +
    `Color: ${selectedColor}\n` +
    `Quantity: ${quantity}\n` +
    `Price: ${formatCurrency(finalPrice * quantity)}\n` +
    `Product ID: ${product.slug || product.id}`;
  const whatsappUrl = formatWhatsAppUrl(activeWhatsApp, whatsappMessage);

  const relatedProducts = relatedProductsData?.pages?.[0]?.data?.filter(p => p.id !== product.id).slice(0, 4) || [];

  const images = product.images && product.images.length > 0 
    ? product.images 
    : [{ id: '1', url: '/images/asora-hero.jpg', sortOrder: 0 }];

  // Schema.org Structured Data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description,
    image: images.map((img) => img.url),
    brand: {
      '@type': 'Brand',
      name: 'ASORA',
    },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'PKR',
      price: finalPrice,
      availability: !isOutOfStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      url: `https://asora-streetwear.netlify.app/products/${product.slug || product.id}`,
      seller: {
        '@type': 'Organization',
        name: 'ASORA',
      },
    },
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 pb-20">
      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="container max-w-6xl mx-auto py-4 sm:py-6 px-4 sm:px-6 space-y-6">
        
        {/* Breadcrumbs */}
        <Breadcrumbs items={[
          { label: 'HOME', href: '/' },
          { label: 'THE COLLECTION', href: '/products' },
          ...(product.category ? [{ label: product.category.name.toUpperCase(), href: `/products?category=${product.category.slug}` }] : []),
          { label: product.title.toUpperCase(), href: '#' },
        ]} className="text-zinc-500 font-mono text-[11px]" />

        {/* ── MAIN PRODUCT GRID (2 COLS) ───────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          
          {/* LEFT: Image Gallery (6 cols on desktop, pinned sticky) */}
          <div className="lg:col-span-6 space-y-3 lg:sticky lg:top-20">
            <div className="relative w-full aspect-square max-h-[420px] sm:max-h-[460px] lg:max-h-[480px] rounded-lg overflow-hidden bg-zinc-900 border border-zinc-800 shadow-xl group mx-auto flex items-center justify-center">
              <img
                src={images[activeImageIndex]?.url || '/images/asora-hero.jpg'}
                alt={product.title}
                className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/images/asora-hero.jpg';
                }}
              />
              
              {/* Badges */}
              <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
                <span className="px-2 py-0.5 rounded bg-zinc-950/90 border border-zinc-800 text-[10px] font-mono font-bold text-rose-400 uppercase tracking-widest backdrop-blur-md">
                  ASORA ORIGINAL
                </span>
                {discount.isSale && (
                  <span className="px-2 py-0.5 rounded bg-rose-600 text-[10px] font-mono font-bold text-white uppercase tracking-widest">
                    {discount.discountPercent}% OFF
                  </span>
                )}
              </div>

              {/* Wishlist Button */}
              <button
                type="button"
                onClick={toggleWishlist}
                aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                className="absolute top-3 right-3 h-8 w-8 rounded-full bg-zinc-950/80 border border-zinc-800 text-zinc-300 hover:text-rose-500 flex items-center justify-center transition-all backdrop-blur-md z-10"
              >
                <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
              </button>
            </div>

            {/* Thumbnail Strip */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none justify-center lg:justify-start">
                {images.map((img, idx) => (
                  <button
                    key={img.id || idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-14 sm:w-16 aspect-square rounded-md overflow-hidden border-2 transition-all shrink-0 ${
                      activeImageIndex === idx
                        ? 'border-rose-500 opacity-100 shadow-md'
                        : 'border-zinc-800 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: Product Details & Purchase Actions (6 cols on desktop) */}
          <div className="lg:col-span-6 space-y-4 text-left">
            
            {/* Header info */}
            <div className="space-y-1.5 border-b border-zinc-850 pb-3.5">
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-rose-500 text-[10px] font-mono font-bold tracking-widest uppercase">
                <span>{product.category?.name || 'STREETWEAR'}</span>
              </div>

              <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-zinc-100 uppercase leading-snug font-sans">
                {product.title}
              </h1>

              {/* Price Row */}
              <div className="flex items-baseline gap-2.5 pt-1">
                <span className="text-xl sm:text-2xl font-black font-mono text-zinc-100">
                  {formatCurrency(finalPrice)}
                </span>
                {discount.isSale && (
                  <span className="text-xs font-mono text-zinc-500 line-through">
                    {formatCurrency(discount.originalPrice)}
                  </span>
                )}
              </div>

              {/* Review summary indicator */}
              <div className="flex items-center gap-1.5 pt-0.5 text-[11px] font-mono text-zinc-400">
                <div className="flex gap-0.5 text-rose-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-3 w-3 fill-rose-500" />
                  ))}
                </div>
                <span>{reviewSummary?.reviewCount ? `${reviewSummary.reviewCount} VERIFIED REVIEWS` : 'ASORA DROP RATED'}</span>
              </div>
            </div>

            {/* Description */}
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
              {product.description || 'Engineered with premium 240+ GSM combed cotton for a relaxed, heavyweight streetwear fit. Fade-resistant screenprinted graphics designed to stand out.'}
            </p>

            {/* Variant / Size Selector */}
            {product.variants && product.variants.length > 0 && (
              <div className="space-y-2.5">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-300">
                    SELECT SIZE (OVERSIZED FIT)
                  </span>
                  <Dialog open={isSizeGuideOpen} onOpenChange={setIsSizeGuideOpen}>
                    <DialogTrigger render={<button type="button" className="text-[11px] font-mono text-rose-400 hover:text-rose-300 flex items-center gap-1 uppercase underline cursor-pointer" />}>
                      <Ruler className="h-3 w-3" />
                      <span>SIZE GUIDE</span>
                    </DialogTrigger>
                    <DialogContent className="bg-zinc-950 border-zinc-800 text-zinc-100 max-w-lg">
                      <DialogHeader>
                        <DialogTitle className="text-base font-mono font-black uppercase text-zinc-100">
                          ASORA STREETWEAR SIZE GUIDE
                        </DialogTitle>
                      </DialogHeader>
                      <div className="py-4">
                        <table className="w-full text-xs font-mono border-collapse">
                          <thead>
                            <tr className="border-b border-zinc-800 text-rose-400">
                              <th className="py-2 text-left">SIZE</th>
                              <th className="py-2 text-left">CHEST</th>
                              <th className="py-2 text-left">LENGTH</th>
                              <th className="py-2 text-left">SHOULDER</th>
                            </tr>
                          </thead>
                          <tbody>
                            {SIZE_GUIDE_DATA.map((row) => (
                              <tr key={row.size} className="border-b border-zinc-900 hover:bg-zinc-900/50">
                                <td className="py-2.5 font-bold text-zinc-100">{row.size}</td>
                                <td className="py-2.5 text-zinc-400">{row.chest}</td>
                                <td className="py-2.5 text-zinc-400">{row.length}</td>
                                <td className="py-2.5 text-zinc-400">{row.shoulder}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        <p className="text-[11px] font-mono text-zinc-500 mt-4">
                          Note: All ASORA t-shirts are cut with a modern boxy drop-shoulder oversized fit. Order your normal size for an oversized look.
                        </p>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="flex flex-wrap gap-2">
                  {product.variants.map((v) => {
                    const isSelected = selectedVariantId === v.id;
                    const sizeLabel = (v.attributes as any)?.size || v.sku || 'STANDARD';
                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => setSelectedVariantId(v.id)}
                        className={`h-9 min-w-[44px] px-3 rounded text-xs font-mono font-bold border transition-all ${
                          isSelected
                            ? 'bg-rose-600 text-white border-rose-500 shadow-md'
                            : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                        }`}
                      >
                        {sizeLabel}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity Stepper & Stock */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-zinc-400 uppercase">QUANTITY</span>
                <span className={isOutOfStock ? 'text-rose-500 font-bold' : 'text-emerald-400'}>
                  {isOutOfStock ? 'OUT OF STOCK' : 'IN STOCK • READY TO DISPATCH'}
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="flex items-center border border-zinc-800 rounded bg-zinc-900 h-10">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="h-full px-2.5 text-zinc-400 hover:text-zinc-100 disabled:opacity-30"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="w-8 text-center font-mono font-bold text-xs text-zinc-100">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    className="h-full px-2.5 text-zinc-400 hover:text-zinc-100"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>

                <Button
                  type="button"
                  disabled={isOutOfStock || addToCartMutation.isPending}
                  onClick={handleAddToCart}
                  className="flex-1 h-10 bg-rose-600 hover:bg-rose-700 text-white font-mono font-black text-xs uppercase tracking-widest rounded shadow-xl flex items-center justify-center gap-2"
                >
                  {addToCartMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ShoppingBag className="h-4 w-4" />
                  )}
                  <span>ADD TO CART</span>
                </Button>
              </div>

              {/* Buy Now & WhatsApp Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-0.5">
                <Button
                  type="button"
                  disabled={isOutOfStock || addToCartMutation.isPending}
                  onClick={handleBuyNow}
                  variant="outline"
                  className="h-10 border-zinc-800 bg-zinc-900/90 hover:bg-zinc-850 text-zinc-100 font-mono font-bold text-xs uppercase tracking-wider rounded"
                >
                  <Zap className="h-3.5 w-3.5 text-rose-500" />
                  <span>BUY NOW</span>
                </Button>

                <WhatsAppOrderDialog
                  items={[{
                    title: product.title,
                    size: selectedSize,
                    color: selectedColor,
                    quantity: quantity,
                    price: finalPrice,
                    slugOrId: product.slug || product.id,
                  }]}
                  totalPrice={finalPrice * quantity}
                  triggerText="ORDER ON WHATSAPP"
                  triggerClassName="h-10 border-emerald-900/40 bg-emerald-950/30 hover:bg-emerald-900/50 text-emerald-400 font-mono font-bold text-xs uppercase tracking-wider rounded gap-2 w-full flex items-center justify-center shadow-md"
                />
              </div>
            </div>

            {/* ── EXPANDABLE ACCORDIONS ─────────────────────────────── */}
            <div className="border-t border-zinc-850 pt-3 space-y-2 font-mono">
              
              {/* Accordion 1: Product Details */}
              <div className="border border-zinc-850 rounded bg-zinc-900/40 overflow-hidden">
                <button
                  type="button"
                  onClick={() => toggleAccordion('details')}
                  className="w-full p-3 text-[11px] font-bold text-zinc-200 flex justify-between items-center uppercase"
                >
                  <span>PRODUCT SPECIFICATIONS</span>
                  {openAccordions.details ? <ChevronUp className="h-3.5 w-3.5 text-rose-500" /> : <ChevronDown className="h-3.5 w-3.5 text-zinc-500" />}
                </button>
                {openAccordions.details && (
                  <div className="p-3 pt-0 text-[11px] text-zinc-400 space-y-1 border-t border-zinc-850/60 mt-1">
                    <p>• 100% Combed Heavyweight Cotton (240+ GSM)</p>
                    <p>• Drop-shoulder boxy streetwear silhouette</p>
                    <p>• High-density Direct-to-Film (DTF) screenprint</p>
                    <p>• Pre-shrunk fabric to preserve fit after wash</p>
                  </div>
                )}
              </div>

              {/* Accordion 2: Shipping & COD */}
              <div className="border border-zinc-850 rounded bg-zinc-900/40 overflow-hidden">
                <button
                  type="button"
                  onClick={() => toggleAccordion('shipping')}
                  className="w-full p-3 text-[11px] font-bold text-zinc-200 flex justify-between items-center uppercase"
                >
                  <span>SHIPPING & DELIVERY</span>
                  {openAccordions.shipping ? <ChevronUp className="h-3.5 w-3.5 text-rose-500" /> : <ChevronDown className="h-3.5 w-3.5 text-zinc-500" />}
                </button>
                {openAccordions.shipping && (
                  <div className="p-3 pt-0 text-[11px] text-zinc-400 space-y-1 border-t border-zinc-850/60 mt-1">
                    <p>• Nationwide Delivery across Pakistan (3–5 business days)</p>
                    <p>• FREE delivery on all orders over PKR 2,500</p>
                    <p>• Cash on Delivery (COD) & Online Bank Transfer supported</p>
                    <p>• 7-day hassle-free replacement on defect items</p>
                  </div>
                )}
              </div>

              {/* Accordion 3: Care Instructions */}
              <div className="border border-zinc-850 rounded bg-zinc-900/40 overflow-hidden">
                <button
                  type="button"
                  onClick={() => toggleAccordion('care')}
                  className="w-full p-3 text-[11px] font-bold text-zinc-200 flex justify-between items-center uppercase"
                >
                  <span>CARE INSTRUCTIONS</span>
                  {openAccordions.care ? <ChevronUp className="h-3.5 w-3.5 text-rose-500" /> : <ChevronDown className="h-3.5 w-3.5 text-zinc-500" />}
                </button>
                {openAccordions.care && (
                  <div className="p-3 pt-0 text-[11px] text-zinc-400 space-y-1 border-t border-zinc-850/60 mt-1">
                    <p>• Machine wash cold inside-out with like colors</p>
                    <p>• Do not bleach or dry clean</p>
                    <p>• Hang dry in shade for print longevity</p>
                    <p>• Iron on reverse side only — NEVER iron directly on print</p>
                  </div>
                )}
              </div>

            </div>

          </div>

        </div>

        {/* ── REVIEWS SECTION ───────────────────────────────────────── */}
        <div className="border-t border-zinc-850 pt-10">
          <ProductReviewsSection productId={product.id} />
        </div>

        {/* ── YOU MAY ALSO LIKE (RELATED PRODUCTS) ─────────────────── */}
        {relatedProducts.length > 0 && (
          <div className="border-t border-zinc-850 pt-10 space-y-6">
            <div className="flex justify-between items-end">
              <div>
                <span className="text-[10px] font-mono font-bold text-rose-500 uppercase tracking-widest">
                  CURATED RECOMMENDATIONS
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-zinc-100 uppercase tracking-tight">
                  YOU MAY ALSO LIKE
                </h2>
              </div>
              <Link href="/products" className="text-xs font-mono font-bold text-rose-400 hover:text-rose-300 uppercase flex items-center gap-1">
                <span>VIEW ALL</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
