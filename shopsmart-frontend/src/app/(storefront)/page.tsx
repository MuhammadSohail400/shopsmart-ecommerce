"use client";

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ShoppingBag, Sparkles, Truck, ShieldCheck, RefreshCw, Star, CheckCircle2, Flame, Tag, Layers, TrendingUp, Percent } from 'lucide-react';
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
  const saleProducts = products.filter(p => p.slug.length % 2 === 0).slice(0, 8);

  return (
    <div className="flex flex-col gap-0 pb-12 overflow-x-hidden">
      
      {/* 1. Compact Hero / Fashion Campaign (400-480px on desktop, 320-380px on mobile) */}
      <section className="relative overflow-hidden bg-background border-b border-border/40">
        {isLoadingBanners ? (
          <Skeleton className="w-full min-h-[380px] md:min-h-[460px] rounded-none" />
        ) : activeBanner ? (
          <div className="relative w-full min-h-[380px] sm:min-h-[420px] md:min-h-[480px] flex items-center py-10 sm:py-14 md:py-16">
            <div 
              className="absolute inset-0 z-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${activeBanner.imageUrl})` }}
            />
            <div className="absolute inset-0 z-0 bg-gradient-to-r from-background via-background/90 md:via-background/75 to-background/30" />
            
            <div className="container max-w-7xl mx-auto relative z-10 flex flex-col items-start justify-center px-4 sm:px-6">
              <Badge className="mb-2.5 sm:mb-4 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 pointer-events-none px-3 py-1 text-xs font-black uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                New Season Collection
              </Badge>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-2.5 sm:mb-4 max-w-2xl leading-[1.15] text-foreground uppercase">
                Elevate Your <span className="text-primary">Everyday Style</span>
              </h1>
              <p className="text-xs sm:text-sm md:text-base text-muted-foreground mb-5 sm:mb-6 max-w-lg font-medium leading-relaxed">
                Discover premium shirts, modern essentials, and timeless fashion designed for effortless confidence and sophisticated comfort.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
                <Link
                  href={activeBanner.linkUrl || "/products"}
                  className={buttonVariants({
                    size: "lg",
                    className: "w-full sm:w-auto h-11 sm:h-12 px-6 sm:px-8 text-xs sm:text-sm font-black uppercase tracking-wider shadow-lg hover:shadow-xl transition-all rounded-full flex items-center justify-center gap-2",
                  })}
                >
                  Shop Men&apos;s Collection <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/products?category=new-arrivals"
                  className={buttonVariants({
                    variant: "outline",
                    size: "lg",
                    className: "w-full sm:w-auto h-11 sm:h-12 px-6 sm:px-8 text-xs sm:text-sm font-black uppercase tracking-wider bg-background/80 backdrop-blur-sm rounded-full flex items-center justify-center border-border/80",
                  })}
                >
                  Explore New Arrivals
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="relative w-full min-h-[380px] sm:min-h-[420px] md:min-h-[460px] flex items-center py-10 sm:py-14 md:py-16 bg-gradient-to-tr from-primary/10 via-background to-background">
            <div className="container max-w-7xl mx-auto flex flex-col items-start justify-center px-4 sm:px-6">
              <Badge className="mb-2.5 sm:mb-4 bg-primary/15 text-primary border-primary/20 hover:bg-primary/20 pointer-events-none px-3 py-1 text-xs font-black uppercase tracking-wider">
                <Flame className="w-3.5 h-3.5 mr-1.5 text-primary" />
                New Season Menswear
              </Badge>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-2.5 sm:mb-4 max-w-2xl leading-[1.15] text-foreground uppercase">
                Elevate Your <span className="text-primary">Everyday Style</span>
              </h1>
              <p className="text-xs sm:text-sm md:text-base text-muted-foreground mb-5 sm:mb-6 max-w-lg font-medium leading-relaxed">
                Discover premium shirts, modern essentials, and timeless fashion crafted with 100% fine cotton and tailored fits.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
                <Link
                  href="/products"
                  className={buttonVariants({
                    size: "lg",
                    className: "w-full sm:w-auto h-11 sm:h-12 px-6 sm:px-8 text-xs sm:text-sm font-black uppercase tracking-wider shadow-lg hover:shadow-xl transition-all rounded-full flex items-center justify-center gap-2",
                  })}
                >
                  Shop Men&apos;s Collection <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/products?category=new-arrivals"
                  className={buttonVariants({
                    variant: "outline",
                    size: "lg",
                    className: "w-full sm:w-auto h-11 sm:h-12 px-6 sm:px-8 text-xs sm:text-sm font-black uppercase tracking-wider bg-background/80 backdrop-blur-sm rounded-full flex items-center justify-center border-border/80",
                  })}
                >
                  Explore New Arrivals
                </Link>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* 2. Shop by Category */}
      <section className="container max-w-7xl mx-auto py-8 sm:py-12 px-4 sm:px-6">
        <div className="flex justify-between items-end mb-6 sm:mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 text-primary text-xs font-black mb-1 uppercase tracking-widest">
              <Tag className="h-3.5 w-3.5" /> Department
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground uppercase">Shop by Category</h2>
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

      {/* 3. New Arrivals (Product-First Merchandising) */}
      <SectionErrorBoundary fallbackTitle="New arrivals unavailable">
        <section className="container max-w-7xl mx-auto py-8 sm:py-12 border-t border-border/40 px-4 sm:px-6">
          <div className="flex justify-between items-end mb-6 sm:mb-8">
            <div>
              <div className="inline-flex items-center gap-1.5 text-primary text-xs font-black mb-1 uppercase tracking-widest">
                <Flame className="h-3.5 w-3.5" /> Fresh Drops
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground uppercase">New Arrivals</h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">Fresh styles and fine fabrics just added to the wardrobe.</p>
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

      {/* 4. Best Sellers */}
      <SectionErrorBoundary fallbackTitle="Best sellers unavailable">
        <section className="container max-w-7xl mx-auto py-8 sm:py-12 border-t border-border/40 px-4 sm:px-6">
          <div className="flex justify-between items-end mb-6 sm:mb-8">
            <div>
              <div className="inline-flex items-center gap-1.5 text-primary text-xs font-black mb-1 uppercase tracking-widest">
                <Sparkles className="h-3.5 w-3.5" /> Customer Favorites
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground uppercase">Best Sellers</h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">The most wanted fashion shirts and everyday essentials.</p>
            </div>
            <Link href="/products?sort=best_selling" className="text-primary font-bold hover:underline flex items-center gap-1 group text-xs sm:text-sm">
              Shop All Best Sellers <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
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

      {/* 5. Trending Collection Interactive Tabs */}
      <SectionErrorBoundary fallbackTitle="Trending collection unavailable">
        <section className="container max-w-7xl mx-auto py-8 sm:py-12 border-t border-border/40 px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 sm:mb-8">
            <div>
              <div className="inline-flex items-center gap-1.5 text-primary text-xs font-black mb-1 uppercase tracking-widest">
                <TrendingUp className="h-3.5 w-3.5" /> Trending Now
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground uppercase">Popular Cuts & Weaves</h2>
            </div>
            
            {/* Interactive Category Tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-secondary/50 rounded-full border border-border/60 overflow-x-auto scrollbar-none">
              {(['all', 'formal', 'casual', 'linen', 'sale'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTrendingTab(tab)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold capitalize transition-all whitespace-nowrap ${
                    activeTrendingTab === tab
                      ? 'bg-primary text-primary-foreground shadow-xs'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                  }`}
                >
                  {tab === 'all' ? 'All Styles' : tab === 'formal' ? 'Formal & Oxford' : tab === 'casual' ? 'Casual Wear' : tab === 'linen' ? 'Linen Shirts' : 'Special Sale'}
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
              title="No products in this category"
              description="Explore other categories to find premium clothing."
            />
          )}
        </section>
      </SectionErrorBoundary>

      {/* 6. Promotional Mid-Page Banner (Up to 50% Off) */}
      <section className="container max-w-7xl mx-auto py-6 sm:py-8 px-4 sm:px-6">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white p-8 sm:p-12 md:p-16 border border-white/10 shadow-xl">
          <div className="relative z-10 max-w-xl">
            <Badge className="mb-3 bg-rose-500 text-white font-black text-xs px-3 py-1 border-none shadow-xs">
              <Percent className="w-3.5 h-3.5 mr-1" /> LIMITED TIME OFFER
            </Badge>
            <h3 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight mb-3 uppercase leading-tight">
              Mid-Season Sale <br />
              <span className="text-amber-400">Up to 50% OFF</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 mb-6 font-medium leading-relaxed">
              Refresh your wardrobe with premium formal shirts, casual linens, and denim at unmatched seasonal discounts.
            </p>
            <Link
              href="/products?category=sale"
              className={buttonVariants({
                size: "lg",
                className: "bg-white text-slate-900 hover:bg-slate-100 font-black text-xs sm:text-sm uppercase tracking-wider rounded-full px-8 shadow-lg h-11 sm:h-12",
              })}
            >
              Shop Sale Collection
            </Link>
          </div>
        </div>
      </section>

      {/* 7. Sale Products */}
      {saleProducts.length > 0 && (
        <SectionErrorBoundary fallbackTitle="Sale collection unavailable">
          <section className="container max-w-7xl mx-auto py-8 sm:py-12 border-t border-border/40 px-4 sm:px-6">
            <div className="flex justify-between items-end mb-6 sm:mb-8">
              <div>
                <div className="inline-flex items-center gap-1.5 text-rose-600 text-xs font-black mb-1 uppercase tracking-widest">
                  <Percent className="h-3.5 w-3.5" /> Discounted Deals
                </div>
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground uppercase">Sale Collection</h2>
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">Exclusive discounts on premium shirts and essentials.</p>
              </div>
              <Link href="/products?category=sale" className="text-rose-600 font-bold hover:underline flex items-center gap-1 group text-xs sm:text-sm">
                View All Deals <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
            
            <ProductGrid>
              {saleProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </ProductGrid>
          </section>
        </SectionErrorBoundary>
      )}

      {/* 8. Trust Features / Value Propositions */}
      <section className="border-y border-border/50 bg-secondary/15 py-8 sm:py-10">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-card border border-border/40 shadow-2xs">
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary shrink-0">
                <Truck className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs sm:text-sm font-extrabold text-foreground truncate">Fast Delivery</h4>
                <p className="text-[10px] sm:text-[11px] text-muted-foreground mt-0.5 truncate">Orders over Rs. 2,500 free</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-2xl bg-card border border-border/40 shadow-2xs">
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary shrink-0">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs sm:text-sm font-extrabold text-foreground truncate">Secure Payments</h4>
                <p className="text-[10px] sm:text-[11px] text-muted-foreground mt-0.5 truncate">100% encrypted & verified</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-2xl bg-card border border-border/40 shadow-2xs">
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary shrink-0">
                <RefreshCw className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs sm:text-sm font-extrabold text-foreground truncate">Easy Returns</h4>
                <p className="text-[10px] sm:text-[11px] text-muted-foreground mt-0.5 truncate">30-day exchange policy</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-2xl bg-card border border-border/40 shadow-2xs">
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary shrink-0">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs sm:text-sm font-extrabold text-foreground truncate">Authentic Quality</h4>
                <p className="text-[10px] sm:text-[11px] text-muted-foreground mt-0.5 truncate">Direct brand guarantee</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 9. Verified Customer Reviews & Social Proof */}
      <section className="container max-w-7xl mx-auto py-10 sm:py-16 px-4 sm:px-6">
        <div className="text-center max-w-xl mx-auto mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-1.5 text-primary text-xs font-black mb-1 uppercase tracking-widest">
            <Star className="h-3.5 w-3.5 fill-primary text-primary" /> Verified Experience
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground uppercase">What Our Customers Say</h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">Real feedback from gentlemen wearing ShopSmart apparel.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          <div className="p-5 sm:p-6 rounded-3xl border border-border/50 bg-card shadow-2xs flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex text-amber-400 gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <p className="text-xs sm:text-sm text-foreground/90 font-medium leading-relaxed italic">
                &quot;The Classic White Oxford Shirt is exceptionally well-tailored. Fabric thickness is just right for year-round wear in Lahore.&quot;
              </p>
            </div>
            <div className="mt-4 pt-4 border-t border-border/30 flex items-center justify-between">
              <div>
                <span className="font-bold text-xs text-foreground block">Ahmed Khan</span>
                <span className="text-[10px] text-muted-foreground">Verified Buyer • Lahore</span>
              </div>
              <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-bold">
                Verified
              </Badge>
            </div>
          </div>

          <div className="p-5 sm:p-6 rounded-3xl border border-border/50 bg-card shadow-2xs flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex text-amber-400 gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <p className="text-xs sm:text-sm text-foreground/90 font-medium leading-relaxed italic">
                &quot;Pure linen casual shirt is super breathable and comfortable. Delivered in 2 days via cash on delivery!&quot;
              </p>
            </div>
            <div className="mt-4 pt-4 border-t border-border/30 flex items-center justify-between">
              <div>
                <span className="font-bold text-xs text-foreground block">Bilal Tariq</span>
                <span className="text-[10px] text-muted-foreground">Verified Buyer • Karachi</span>
              </div>
              <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-bold">
                Verified
              </Badge>
            </div>
          </div>

          <div className="p-5 sm:p-6 rounded-3xl border border-border/50 bg-card shadow-2xs flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex text-amber-400 gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <p className="text-xs sm:text-sm text-foreground/90 font-medium leading-relaxed italic">
                &quot;Clean design, smooth checkout, and exact size chart measurements. Will definitely order again.&quot;
              </p>
            </div>
            <div className="mt-4 pt-4 border-t border-border/30 flex items-center justify-between">
              <div>
                <span className="font-bold text-xs text-foreground block">Hamza Siddiqui</span>
                <span className="text-[10px] text-muted-foreground">Verified Buyer • Islamabad</span>
              </div>
              <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-bold">
                Verified
              </Badge>
            </div>
          </div>
        </div>
      </section>

      {/* 10. Recently Viewed */}
      <SectionErrorBoundary fallbackTitle="Recently viewed unavailable">
        <RecentlyViewedSection />
      </SectionErrorBoundary>

      {/* 11. Newsletter Subscription ("Stay in Style") */}
      <NewsletterSection />
    </div>
  );
}
