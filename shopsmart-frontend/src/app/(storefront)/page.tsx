"use client";

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ShoppingBag, Sparkles, Truck, ShieldCheck, RefreshCw, Zap, Star, CheckCircle2, Flame, Tag, Layers, TrendingUp, Percent } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProductCard } from '@/components/storefront/product-card';
import { ProductGrid, ProductGridSkeleton } from '@/components/storefront/product-grid';
import { useBanners, useCategories, useProducts } from '@/hooks/use-catalog';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/empty-state';
import { NewsletterSection } from '@/components/storefront/newsletter-section';
import { RecentlyViewedSection } from '@/components/storefront/recently-viewed-section';
import { SectionErrorBoundary } from '@/components/shared/section-error-boundary';

export default function HomePage() {
  const { data: banners, isLoading: isLoadingBanners } = useBanners();
  const { data: categories, isLoading: isLoadingCategories } = useCategories();
  const { data: productsData, isLoading: isLoadingProducts } = useProducts({ limit: 24 });

  const [activeTrendingTab, setActiveTrendingTab] = useState<'all' | 'formal' | 'casual' | 'linen' | 'sale'>('all');

  const activeBanner = banners && banners.length > 0 ? banners[0] : null;
  const products = productsData?.pages?.[0]?.data || [];

  // Filter products by tab
  const filteredTrending = products.filter(p => {
    if (activeTrendingTab === 'formal') return p.slug.includes('formal') || p.slug.includes('oxford');
    if (activeTrendingTab === 'casual') return p.slug.includes('casual') || p.slug.includes('corduroy');
    if (activeTrendingTab === 'linen') return p.slug.includes('linen');
    if (activeTrendingTab === 'sale') return p.slug.length % 2 === 0;
    return true;
  }).slice(0, 8);

  const newArrivals = products.slice(0, 8);
  const bestSellers = products.slice(4, 12);

  return (
    <div className="flex flex-col gap-0 pb-12 overflow-x-hidden">
      
      {/* 1. Hero / Fashion Campaign */}
      <section className="relative overflow-hidden bg-background border-b border-border/40">
        {isLoadingBanners ? (
          <Skeleton className="w-full min-h-[460px] md:min-h-[560px] rounded-none" />
        ) : activeBanner ? (
          <div className="relative w-full min-h-[460px] sm:min-h-[500px] md:min-h-[580px] flex items-center py-12 sm:py-16 md:py-20">
            <div 
              className="absolute inset-0 z-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${activeBanner.imageUrl})` }}
            />
            <div className="absolute inset-0 z-0 bg-gradient-to-r from-background via-background/90 md:via-background/80 to-background/40" />
            
            <div className="container max-w-7xl mx-auto relative z-10 flex flex-col items-start justify-center px-4 sm:px-6">
              <Badge className="mb-3 sm:mb-5 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 pointer-events-none px-3 py-1 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                New Season Collection
              </Badge>
              <h1 className="text-3xl sm:text-4xl md:text-6xl font-black tracking-tight mb-3 sm:mb-5 max-w-2xl leading-[1.15] text-foreground">
                Elevate Your <span className="text-primary">Everyday Style</span>
              </h1>
              <p className="text-xs sm:text-base md:text-lg text-muted-foreground mb-6 sm:mb-8 max-w-xl font-medium leading-relaxed">
                Discover premium shirts, modern essentials, and timeless fashion designed for effortless confidence and sophisticated comfort.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
                <Link
                  href={activeBanner.linkUrl || "/products"}
                  className={buttonVariants({
                    size: "lg",
                    className: "w-full sm:w-auto h-11 sm:h-12 px-6 sm:px-8 text-xs sm:text-sm font-bold shadow-lg hover:shadow-xl transition-all rounded-full flex items-center justify-center gap-2",
                  })}
                >
                  Shop Men&apos;s Collection <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/products?category=new-arrivals"
                  className={buttonVariants({
                    variant: "outline",
                    size: "lg",
                    className: "w-full sm:w-auto h-11 sm:h-12 px-6 sm:px-8 text-xs sm:text-sm font-bold bg-background/80 backdrop-blur-sm rounded-full flex items-center justify-center border-border/80",
                  })}
                >
                  Explore New Arrivals
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="relative w-full min-h-[440px] sm:min-h-[480px] md:min-h-[540px] flex items-center py-12 sm:py-16 md:py-20 bg-gradient-to-tr from-primary/10 via-background to-background">
            <div className="container max-w-7xl mx-auto flex flex-col items-start justify-center px-4 sm:px-6">
              <Badge className="mb-3 sm:mb-5 bg-primary/15 text-primary border-primary/20 hover:bg-primary/20 pointer-events-none px-3 py-1 text-xs font-bold">
                <Flame className="w-3.5 h-3.5 mr-1.5 text-primary" />
                New Season Menswear
              </Badge>
              <h1 className="text-3xl sm:text-4xl md:text-6xl font-black tracking-tight mb-3 sm:mb-5 max-w-2xl leading-[1.15] text-foreground">
                Elevate Your <span className="text-primary">Everyday Style</span>
              </h1>
              <p className="text-xs sm:text-base md:text-lg text-muted-foreground mb-6 sm:mb-8 max-w-xl font-medium leading-relaxed">
                Discover premium shirts, modern essentials, and timeless fashion crafted with 100% fine cotton and tailored fits.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
                <Link
                  href="/products"
                  className={buttonVariants({
                    size: "lg",
                    className: "w-full sm:w-auto h-11 sm:h-12 px-6 sm:px-8 text-xs sm:text-sm font-bold shadow-lg hover:shadow-xl transition-all rounded-full flex items-center justify-center gap-2",
                  })}
                >
                  Shop Men&apos;s Collection <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/products?category=new-arrivals"
                  className={buttonVariants({
                    variant: "outline",
                    size: "lg",
                    className: "w-full sm:w-auto h-11 sm:h-12 px-6 sm:px-8 text-xs sm:text-sm font-bold bg-background/80 backdrop-blur-sm rounded-full flex items-center justify-center border-border/80",
                  })}
                >
                  Explore New Arrivals
                </Link>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* 2. Value Proposition Trust Strip */}
      <section className="border-b border-border/50 bg-secondary/15 py-5 sm:py-7">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            <div className="flex items-center gap-3 p-3 sm:p-3.5 rounded-2xl bg-card border border-border/40 shadow-2xs">
              <div className="p-2 sm:p-2.5 rounded-xl bg-primary/10 text-primary shrink-0">
                <Truck className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs sm:text-sm font-extrabold text-foreground truncate">Fast Delivery</h4>
                <p className="text-[10px] sm:text-[11px] text-muted-foreground mt-0.5 truncate">Orders over Rs. 2,500 free</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 sm:p-3.5 rounded-2xl bg-card border border-border/40 shadow-2xs">
              <div className="p-2 sm:p-2.5 rounded-xl bg-primary/10 text-primary shrink-0">
                <ShieldCheck className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs sm:text-sm font-extrabold text-foreground truncate">Secure Payments</h4>
                <p className="text-[10px] sm:text-[11px] text-muted-foreground mt-0.5 truncate">100% encrypted & verified</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 sm:p-3.5 rounded-2xl bg-card border border-border/40 shadow-2xs">
              <div className="p-2 sm:p-2.5 rounded-xl bg-primary/10 text-primary shrink-0">
                <RefreshCw className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs sm:text-sm font-extrabold text-foreground truncate">Easy Returns</h4>
                <p className="text-[10px] sm:text-[11px] text-muted-foreground mt-0.5 truncate">30-day exchange policy</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 sm:p-3.5 rounded-2xl bg-card border border-border/40 shadow-2xs">
              <div className="p-2 sm:p-2.5 rounded-xl bg-primary/10 text-primary shrink-0">
                <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs sm:text-sm font-extrabold text-foreground truncate">Authentic Products</h4>
                <p className="text-[10px] sm:text-[11px] text-muted-foreground mt-0.5 truncate">Direct brand guarantee</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Shop by Category */}
      <section className="container max-w-7xl mx-auto py-10 sm:py-14 px-4 sm:px-6">
        <div className="flex justify-between items-end mb-6 sm:mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 text-primary text-xs font-bold mb-1 uppercase tracking-wider">
              <Tag className="h-3.5 w-3.5" /> Department
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">Shop by Category</h2>
          </div>
          <Link href="/categories" className="text-primary font-bold hover:underline flex items-center gap-1 group text-xs sm:text-sm">
            View All <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
        
        {isLoadingCategories ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[4/3] rounded-2xl" />
            ))}
          </div>
        ) : categories && categories.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {categories
              .filter(c => !['men', 'women', 'kids', 'collections'].includes(c.slug))
              .slice(0, 6)
              .map((category) => (
                <Link 
                  key={category.id} 
                  href={`/products?category=${category.slug}`}
                  className="group flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border border-border/50 bg-card hover:bg-primary/5 hover:border-primary/40 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
                >
                  <div className="h-11 w-11 sm:h-12 sm:w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 shadow-2xs">
                    <ShoppingBag className="h-5 w-5" />
                  </div>
                  <span className="font-bold text-xs sm:text-sm text-center group-hover:text-primary transition-colors line-clamp-1">
                    {category.name}
                  </span>
                </Link>
              ))}
          </div>
        ) : null}
      </section>

      {/* 4. New Arrivals */}
      <SectionErrorBoundary fallbackTitle="New arrivals unavailable">
        <section className="container max-w-7xl mx-auto py-8 sm:py-12 border-t border-border/40 px-4 sm:px-6">
          <div className="flex justify-between items-end mb-6 sm:mb-8">
            <div>
              <div className="inline-flex items-center gap-1.5 text-primary text-xs font-bold mb-1 uppercase tracking-wider">
                <Flame className="h-3.5 w-3.5" /> Fresh Drops
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">New Arrivals</h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">Fresh styles and fabrics just added to the collection.</p>
            </div>
            <Link href="/products?category=new-arrivals" className="text-primary font-bold hover:underline flex items-center gap-1 group text-xs sm:text-sm">
              Explore All <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
          
          {isLoadingProducts ? (
            <ProductGridSkeleton count={8} />
          ) : newArrivals.length > 0 ? (
            <ProductGrid>
              {newArrivals.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </ProductGrid>
          ) : null}
        </section>
      </SectionErrorBoundary>

      {/* 5. Trending Shirts / Interactive Tabs */}
      <SectionErrorBoundary fallbackTitle="Trending collection unavailable">
        <section className="container max-w-7xl mx-auto py-8 sm:py-12 border-t border-border/40 px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 sm:mb-8">
            <div>
              <div className="inline-flex items-center gap-1.5 text-primary text-xs font-bold mb-1 uppercase tracking-wider">
                <TrendingUp className="h-3.5 w-3.5" /> Top Picks
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">Trending Now</h2>
            </div>
            
            {/* Interactive Tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-secondary/50 rounded-full border border-border/60 overflow-x-auto max-w-full">
              {(['all', 'formal', 'casual', 'linen', 'sale'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTrendingTab(tab)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold capitalize transition-all whitespace-nowrap ${
                    activeTrendingTab === tab
                      ? 'bg-primary text-primary-foreground shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {tab === 'all' ? 'All Shirts' : tab}
                </button>
              ))}
            </div>
          </div>
          
          {isLoadingProducts ? (
            <ProductGridSkeleton count={8} />
          ) : filteredTrending.length > 0 ? (
            <ProductGrid>
              {filteredTrending.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </ProductGrid>
          ) : (
            <EmptyState
              icon={<ShoppingBag />}
              title="No products in this section"
              description="Explore our full collection for more options."
              action={
                <Link href="/products" className={buttonVariants({ variant: "outline", className: "rounded-full" })}>
                  Browse Catalog
                </Link>
              }
            />
          )}
        </section>
      </SectionErrorBoundary>

      {/* 6. Promotional Sale Banner */}
      <section className="container max-w-7xl mx-auto py-6 sm:py-8 px-4 sm:px-6">
        <div className="relative rounded-3xl bg-gradient-to-r from-primary via-indigo-700 to-slate-900 text-primary-foreground p-6 sm:p-10 md:p-12 overflow-hidden shadow-xl">
          <div className="relative z-10 max-w-xl space-y-3">
            <Badge className="bg-white/20 text-white hover:bg-white/30 border-none font-bold text-xs">
              <Percent className="w-3.5 h-3.5 mr-1" /> UP TO 50% OFF
            </Badge>
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight leading-tight">
              Refresh Your Wardrobe
            </h3>
            <p className="text-xs sm:text-sm text-primary-foreground/90 leading-relaxed max-w-md">
              Upgrade your everyday rotation with breathable linens, tailored Oxfords, and fine cotton essentials at special promotional prices.
            </p>
            <div className="pt-2">
              <Link
                href="/products?category=sale"
                className={buttonVariants({
                  variant: "secondary",
                  size: "lg",
                  className: "rounded-full font-bold shadow-md text-xs sm:text-sm h-11 px-6 bg-white text-primary hover:bg-white/90",
                })}
              >
                Shop Sale Collection <ArrowRight className="h-4 w-4 ml-1.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Best Sellers */}
      <SectionErrorBoundary fallbackTitle="Best sellers unavailable">
        <section className="container max-w-7xl mx-auto py-8 sm:py-12 border-t border-border/40 px-4 sm:px-6">
          <div className="flex justify-between items-end mb-6 sm:mb-8">
            <div>
              <div className="inline-flex items-center gap-1.5 text-primary text-xs font-bold mb-1 uppercase tracking-wider">
                <Star className="h-3.5 w-3.5" /> Highly Rated
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">Best Sellers</h2>
            </div>
            <Link href="/products?category=best-sellers" className="text-primary font-bold hover:underline flex items-center gap-1 group text-xs sm:text-sm">
              View All <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
          
          {isLoadingProducts ? (
            <ProductGridSkeleton count={8} />
          ) : bestSellers.length > 0 ? (
            <ProductGrid>
              {bestSellers.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </ProductGrid>
          ) : null}
        </section>
      </SectionErrorBoundary>

      {/* 8. Customer Reviews & Social Proof */}
      <section className="container max-w-7xl mx-auto py-10 sm:py-14 border-t border-border/40 px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
          <Badge className="bg-primary/10 text-primary border-primary/20 mb-2 text-[11px] font-bold">
            Customer Feedback
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
            What Customers Say
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1.5">
            Real experiences from gentlemen and fashion enthusiasts across the country.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          <div className="p-5 rounded-2xl bg-card border border-border/50 shadow-2xs space-y-3">
            <div className="flex items-center gap-1 text-amber-500">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-amber-500" />
              ))}
            </div>
            <p className="text-xs sm:text-sm text-foreground/90 italic leading-relaxed">
              &quot;Great quality and very fast delivery. The Classic Oxford shirt fits like a bespoke tailor made it.&quot;
            </p>
            <div className="flex items-center gap-2.5 pt-2 border-t border-border/30">
              <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                MR
              </div>
              <div>
                <div className="flex items-center gap-1 text-xs font-bold text-foreground">
                  Marcus R. <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                </div>
                <span className="text-[10px] text-muted-foreground">Verified Buyer • Oxford Shirt</span>
              </div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-card border border-border/50 shadow-2xs space-y-3">
            <div className="flex items-center gap-1 text-amber-500">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-amber-500" />
              ))}
            </div>
            <p className="text-xs sm:text-sm text-foreground/90 italic leading-relaxed">
              &quot;The Relaxed Linen shirt is exceptionally breathable. Kept its structure after machine washing.&quot;
            </p>
            <div className="flex items-center gap-2.5 pt-2 border-t border-border/30">
              <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                JH
              </div>
              <div>
                <div className="flex items-center gap-1 text-xs font-bold text-foreground">
                  James H. <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                </div>
                <span className="text-[10px] text-muted-foreground">Verified Buyer • French Linen</span>
              </div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-card border border-border/50 shadow-2xs space-y-3">
            <div className="flex items-center gap-1 text-amber-500">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-amber-500" />
              ))}
            </div>
            <p className="text-xs sm:text-sm text-foreground/90 italic leading-relaxed">
              &quot;Top-tier quality on the tailored chinos and denim. Clean lines, deep colors, and fast delivery.&quot;
            </p>
            <div className="flex items-center gap-2.5 pt-2 border-t border-border/30">
              <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                EA
              </div>
              <div>
                <div className="flex items-center gap-1 text-xs font-bold text-foreground">
                  Edward A. <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                </div>
                <span className="text-[10px] text-muted-foreground">Verified Buyer • Cotton Chinos</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 9. Recently Viewed Section */}
      <SectionErrorBoundary fallbackTitle="Recently viewed items unavailable">
        <RecentlyViewedSection />
      </SectionErrorBoundary>

      {/* 10. Newsletter Subscription */}
      <SectionErrorBoundary fallbackTitle="Newsletter signup unavailable">
        <NewsletterSection />
      </SectionErrorBoundary>
    </div>
  );
}
