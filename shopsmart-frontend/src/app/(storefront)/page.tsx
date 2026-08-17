"use client";

import Link from 'next/link';
import { ArrowRight, ShoppingBag, Sparkles, Truck, ShieldCheck, RefreshCw, Zap, Star, CheckCircle2, Flame, Tag } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
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
  const { data: productsData, isLoading: isLoadingProducts } = useProducts({ limit: 12 });

  const activeBanner = banners && banners.length > 0 ? banners[0] : null;
  const products = productsData?.pages?.[0]?.data || [];
  const trendingProducts = products.slice(0, 8);
  const newArrivals = products.slice(4, 12);

  return (
    <div className="flex flex-col gap-0 pb-12 overflow-x-hidden">
      
      {/* 1. Hero Section */}
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
                Curated Collection
              </Badge>
              <h1 className="text-3xl sm:text-4xl md:text-6xl font-black tracking-tight mb-3 sm:mb-5 max-w-2xl leading-[1.15] text-foreground">
                Discover Your <span className="text-primary">Next Favorite</span> Item
              </h1>
              <p className="text-xs sm:text-base md:text-lg text-muted-foreground mb-6 sm:mb-8 max-w-xl font-medium leading-relaxed">
                Elevate your everyday lifestyle with high-quality products, authentic brands, and lightning-fast checkout.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
                <Link
                  href={activeBanner.linkUrl || "/products"}
                  className={buttonVariants({
                    size: "lg",
                    className: "w-full sm:w-auto h-11 sm:h-12 px-6 sm:px-8 text-xs sm:text-sm font-bold shadow-lg hover:shadow-xl transition-all rounded-full flex items-center justify-center gap-2",
                  })}
                >
                  Shop Collection <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/categories"
                  className={buttonVariants({
                    variant: "outline",
                    size: "lg",
                    className: "w-full sm:w-auto h-11 sm:h-12 px-6 sm:px-8 text-xs sm:text-sm font-bold bg-background/80 backdrop-blur-sm rounded-full flex items-center justify-center border-border/80",
                  })}
                >
                  Explore Categories
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="relative w-full min-h-[440px] sm:min-h-[480px] md:min-h-[540px] flex items-center py-12 sm:py-16 md:py-20 bg-gradient-to-tr from-primary/10 via-background to-background">
            <div className="container max-w-7xl mx-auto flex flex-col items-start justify-center px-4 sm:px-6">
              <Badge className="mb-3 sm:mb-5 bg-primary/15 text-primary border-primary/20 hover:bg-primary/20 pointer-events-none px-3 py-1 text-xs font-bold">
                <Flame className="w-3.5 h-3.5 mr-1.5 text-primary" />
                New Season Arrivals
              </Badge>
              <h1 className="text-3xl sm:text-4xl md:text-6xl font-black tracking-tight mb-3 sm:mb-5 max-w-2xl leading-[1.15] text-foreground">
                Intelligent Shopping, <span className="text-primary">Curated For You</span>
              </h1>
              <p className="text-xs sm:text-base md:text-lg text-muted-foreground mb-6 sm:mb-8 max-w-xl font-medium leading-relaxed">
                Discover exceptional quality across fashion, tech, home, and lifestyle essentials with transparent pricing.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
                <Link
                  href="/products"
                  className={buttonVariants({
                    size: "lg",
                    className: "w-full sm:w-auto h-11 sm:h-12 px-6 sm:px-8 text-xs sm:text-sm font-bold shadow-lg hover:shadow-xl transition-all rounded-full flex items-center justify-center gap-2",
                  })}
                >
                  Start Shopping <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/categories"
                  className={buttonVariants({
                    variant: "outline",
                    size: "lg",
                    className: "w-full sm:w-auto h-11 sm:h-12 px-6 sm:px-8 text-xs sm:text-sm font-bold bg-background/80 backdrop-blur-sm rounded-full flex items-center justify-center border-border/80",
                  })}
                >
                  Browse Categories
                </Link>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* 2. Value Proposition Trust Strip */}
      <section className="border-b border-border/50 bg-secondary/15 py-6 sm:py-8">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-card border border-border/40 shadow-2xs">
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary shrink-0">
                <Truck className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs sm:text-sm font-bold text-foreground truncate">Free Shipping</h4>
                <p className="text-[11px] text-muted-foreground mt-0.5 truncate">On orders over $50</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-card border border-border/40 shadow-2xs">
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary shrink-0">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs sm:text-sm font-bold text-foreground truncate">100% Authentic</h4>
                <p className="text-[11px] text-muted-foreground mt-0.5 truncate">Verified genuine items</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-card border border-border/40 shadow-2xs">
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary shrink-0">
                <RefreshCw className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs sm:text-sm font-bold text-foreground truncate">30-Day Returns</h4>
                <p className="text-[11px] text-muted-foreground mt-0.5 truncate">Hassle-free guarantee</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-card border border-border/40 shadow-2xs">
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary shrink-0">
                <Zap className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs sm:text-sm font-bold text-foreground truncate">24/7 Support</h4>
                <p className="text-[11px] text-muted-foreground mt-0.5 truncate">Instant assistance</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Featured Categories */}
      <section className="container max-w-7xl mx-auto py-10 sm:py-14 px-4 sm:px-6">
        <div className="flex justify-between items-end mb-6 sm:mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 text-primary text-xs font-bold mb-1 uppercase tracking-wider">
              <Tag className="h-3.5 w-3.5" /> Collections
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
              <Skeleton key={i} className="aspect-square rounded-2xl" />
            ))}
          </div>
        ) : categories && categories.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {categories.slice(0, 6).map((category) => (
              <Link 
                key={category.id} 
                href={`/products?category=${category.slug}`}
                className="group flex flex-col items-center justify-center gap-2.5 p-4 sm:p-5 rounded-2xl border border-border/50 bg-card hover:bg-primary/5 hover:border-primary/40 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
              >
                <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 shadow-2xs">
                  <ShoppingBag className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <span className="font-bold text-xs sm:text-sm text-center group-hover:text-primary transition-colors line-clamp-1">
                  {category.name}
                </span>
              </Link>
            ))}
          </div>
        ) : null}
      </section>

      {/* 4. Trending Products Section */}
      <SectionErrorBoundary fallbackTitle="Trending products unavailable">
        <section className="container max-w-7xl mx-auto py-8 sm:py-12 border-t border-border/40 px-4 sm:px-6">
          <div className="flex justify-between items-end mb-6 sm:mb-8">
            <div>
              <div className="inline-flex items-center gap-1.5 text-primary text-xs font-bold mb-1 uppercase tracking-wider">
                <Flame className="h-3.5 w-3.5" /> Most Popular
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">Trending Now</h2>
            </div>
            <Link href="/products" className="text-primary font-bold hover:underline flex items-center gap-1 group text-xs sm:text-sm">
              Explore All <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
          
          {isLoadingProducts ? (
            <ProductGridSkeleton count={8} />
          ) : trendingProducts.length > 0 ? (
            <ProductGrid>
              {trendingProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </ProductGrid>
          ) : (
            <EmptyState
              icon={<ShoppingBag />}
              title="No products available"
              description="Our inventory is updating. Check back shortly!"
              action={
                <Link href="/products" className={buttonVariants({ variant: "outline", className: "rounded-full" })}>
                  Browse Catalog
                </Link>
              }
            />
          )}
        </section>
      </SectionErrorBoundary>

      {/* 5. Promotional Split Banner */}
      <section className="container max-w-7xl mx-auto py-6 sm:py-8 px-4 sm:px-6">
        <div className="relative rounded-3xl bg-gradient-to-r from-primary via-indigo-600 to-violet-700 text-primary-foreground p-6 sm:p-10 md:p-12 overflow-hidden shadow-xl">
          <div className="relative z-10 max-w-xl space-y-3">
            <Badge className="bg-white/20 text-white hover:bg-white/30 border-none font-bold text-xs">
              Limited Time Special
            </Badge>
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight leading-tight">
              Upgrade Your Setup With Premium Craftsmanship
            </h3>
            <p className="text-xs sm:text-sm text-primary-foreground/90 leading-relaxed max-w-md">
              Enjoy complimentary worldwide express delivery on all premium orders this week.
            </p>
            <div className="pt-2">
              <Link
                href="/products"
                className={buttonVariants({
                  variant: "secondary",
                  size: "lg",
                  className: "rounded-full font-bold shadow-md text-xs sm:text-sm h-11 px-6 bg-white text-primary hover:bg-white/90",
                })}
              >
                Claim Offer <ArrowRight className="h-4 w-4 ml-1.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Customer Social Proof & Testimonials */}
      <section className="container max-w-7xl mx-auto py-10 sm:py-14 border-t border-border/40 px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
          <Badge className="bg-primary/10 text-primary border-primary/20 mb-2 text-[11px] font-bold">
            Verified Reviews
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
            Loved by Shoppers Worldwide
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1.5">
            Real feedback from verified customers who shop with confidence on ShopSmart.
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
              &quot;The checkout process was super seamless and the delivery arrived 2 days earlier than expected. Truly top tier quality.&quot;
            </p>
            <div className="flex items-center gap-2.5 pt-2 border-t border-border/30">
              <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                SL
              </div>
              <div>
                <div className="flex items-center gap-1 text-xs font-bold text-foreground">
                  Sarah L. <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                </div>
                <span className="text-[10px] text-muted-foreground">Verified Buyer</span>
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
              &quot;Finding authentic products with instant order tracking is so refreshing. ShopSmart has become my go-to store.&quot;
            </p>
            <div className="flex items-center gap-2.5 pt-2 border-t border-border/30">
              <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                DK
              </div>
              <div>
                <div className="flex items-center gap-1 text-xs font-bold text-foreground">
                  David K. <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                </div>
                <span className="text-[10px] text-muted-foreground">Verified Buyer</span>
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
              &quot;Amazing customer support when I needed to update my shipping address. Quick, friendly, and resolved in minutes.&quot;
            </p>
            <div className="flex items-center gap-2.5 pt-2 border-t border-border/30">
              <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                MR
              </div>
              <div>
                <div className="flex items-center gap-1 text-xs font-bold text-foreground">
                  Maya R. <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                </div>
                <span className="text-[10px] text-muted-foreground">Verified Buyer</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Recently Viewed Section */}
      <SectionErrorBoundary fallbackTitle="Recently viewed items unavailable">
        <RecentlyViewedSection />
      </SectionErrorBoundary>

      {/* 8. Newsletter Subscription */}
      <SectionErrorBoundary fallbackTitle="Newsletter signup unavailable">
        <NewsletterSection />
      </SectionErrorBoundary>
    </div>
  );
}
