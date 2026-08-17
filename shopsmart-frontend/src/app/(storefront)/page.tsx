"use client";

import Link from 'next/link';
import { ArrowRight, ShoppingBag, Sparkles, Truck, ShieldCheck, RefreshCw, Zap } from 'lucide-react';
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

  return (
    <div className="flex flex-col gap-0 pb-12 overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-background border-b border-border/40">
        {isLoadingBanners ? (
          <Skeleton className="w-full min-h-[480px] md:min-h-[580px] rounded-none" />
        ) : activeBanner ? (
          <div className="relative w-full min-h-[480px] sm:min-h-[520px] md:min-h-[600px] flex items-center py-12 sm:py-16 md:py-20">
            <div 
              className="absolute inset-0 z-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${activeBanner.imageUrl})` }}
            />
            {/* Rich gradient overlay for premium depth */}
            <div className="absolute inset-0 z-0 bg-gradient-to-r from-background via-background/90 md:via-background/80 to-background/40" />
            
            <div className="container relative z-10 flex flex-col items-start justify-center px-4 sm:px-6">
              <Badge className="mb-4 sm:mb-6 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 pointer-events-none px-3.5 py-1 text-xs sm:text-sm">
                <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                Featured Collection
              </Badge>
              <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-4 sm:mb-6 max-w-2xl leading-[1.15] sm:leading-[1.1] text-foreground">
                Discover Your <span className="text-primary">Next Favorite</span> Thing
              </h1>
              <p className="text-sm sm:text-base md:text-xl text-muted-foreground mb-6 sm:mb-8 md:mb-10 max-w-xl font-medium leading-relaxed">
                Browse our latest arrivals and find the perfect addition to your lifestyle with authentic quality and lightning-fast delivery.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
                {activeBanner.linkUrl ? (
                  <Link
                    href={activeBanner.linkUrl}
                    className={buttonVariants({
                      size: "lg",
                      className: "w-full sm:w-auto h-12 sm:h-14 px-6 sm:px-8 text-sm sm:text-base font-semibold shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 rounded-full flex items-center justify-center gap-2",
                    })}
                  >
                    Shop Collection <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
                  </Link>
                ) : (
                  <Link
                    href="/products"
                    className={buttonVariants({
                      size: "lg",
                      className: "w-full sm:w-auto h-12 sm:h-14 px-6 sm:px-8 text-sm sm:text-base font-semibold shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 rounded-full flex items-center justify-center gap-2",
                    })}
                  >
                    Explore Catalog <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
                  </Link>
                )}
                <Link
                  href="/categories"
                  className={buttonVariants({
                    variant: "outline",
                    size: "lg",
                    className: "w-full sm:w-auto h-12 sm:h-14 px-6 sm:px-8 text-sm sm:text-base font-semibold bg-background/80 backdrop-blur-sm rounded-full flex items-center justify-center",
                  })}
                >
                  Browse Categories
                </Link>
              </div>
            </div>
          </div>
        ) : (
          // Fallback Hero if no banners
          <div className="relative w-full min-h-[460px] sm:min-h-[500px] md:min-h-[580px] flex items-center py-12 sm:py-16 md:py-20 bg-gradient-to-tr from-primary/10 via-background to-background">
            <div className="container flex flex-col items-start justify-center px-4 sm:px-6">
              <Badge className="mb-4 sm:mb-6 bg-primary/20 text-primary hover:bg-primary/20 pointer-events-none px-3.5 py-1 text-xs sm:text-sm">
                New Arrivals
              </Badge>
              <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-4 sm:mb-6 max-w-3xl leading-[1.15] sm:leading-[1.1] text-foreground">
                Welcome to <span className="text-primary">ShopSmart</span>
              </h1>
              <p className="text-sm sm:text-base md:text-xl text-muted-foreground mb-6 sm:mb-8 md:mb-10 max-w-xl font-medium leading-relaxed">
                The intelligent way to shop online. Get the best products at the smartest prices with our curated collections.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
                <Link
                  href="/products"
                  className={buttonVariants({
                    size: "lg",
                    className: "w-full sm:w-auto h-12 sm:h-14 px-6 sm:px-8 text-sm sm:text-base font-semibold shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 rounded-full flex items-center justify-center gap-2",
                  })}
                >
                  Start Shopping <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
                </Link>
                <Link
                  href="/categories"
                  className={buttonVariants({
                    variant: "outline",
                    size: "lg",
                    className: "w-full sm:w-auto h-12 sm:h-14 px-6 sm:px-8 text-sm sm:text-base font-semibold bg-background/80 backdrop-blur-sm rounded-full flex items-center justify-center",
                  })}
                >
                  Browse Categories
                </Link>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Value Proposition Strip */}
      <section className="border-b border-border/50 bg-secondary/15 py-6 sm:py-8">
        <div className="container px-4 sm:px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-card border border-border/40 shadow-xs">
              <div className="p-2.5 sm:p-3 rounded-xl bg-primary/10 text-primary shrink-0">
                <Truck className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs sm:text-sm font-bold text-foreground truncate">Free Shipping</h4>
                <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5 truncate">On orders over $50</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-2xl bg-card border border-border/40 shadow-xs">
              <div className="p-2.5 sm:p-3 rounded-xl bg-primary/10 text-primary shrink-0">
                <ShieldCheck className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs sm:text-sm font-bold text-foreground truncate">100% Authentic</h4>
                <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5 truncate">Direct from brands</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-2xl bg-card border border-border/40 shadow-xs">
              <div className="p-2.5 sm:p-3 rounded-xl bg-primary/10 text-primary shrink-0">
                <RefreshCw className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs sm:text-sm font-bold text-foreground truncate">30-Day Returns</h4>
                <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5 truncate">No questions asked</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-2xl bg-card border border-border/40 shadow-xs">
              <div className="p-2.5 sm:p-3 rounded-xl bg-primary/10 text-primary shrink-0">
                <Zap className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs sm:text-sm font-bold text-foreground truncate">Instant Support</h4>
                <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5 truncate">Live assistance</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="container py-12 sm:py-16 md:py-20 px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 sm:mb-10 gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight mb-1 sm:mb-2">Shop by Category</h2>
            <p className="text-muted-foreground text-xs sm:text-base">Explore top collections curated for you.</p>
          </div>
          <Link href="/categories" className="text-primary font-semibold hover:underline flex items-center gap-1 group text-xs sm:text-sm">
            View All Categories <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
        
        {isLoadingCategories ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-2xl" />
            ))}
          </div>
        ) : categories && categories.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-6">
            {categories.slice(0, 6).map((category) => (
              <Link 
                key={category.id} 
                href={`/products?category=${category.slug}`}
                className="group flex flex-col items-center justify-center gap-3 p-4 sm:p-6 md:p-8 rounded-2xl border border-border/50 bg-card hover:bg-primary/5 hover:border-primary/30 transition-all hover:shadow-lg hover:-translate-y-1"
              >
                <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 shadow-xs">
                  <ShoppingBag className="h-6 w-6 sm:h-8 sm:w-8" />
                </div>
                <span className="font-bold text-xs sm:text-sm md:text-base text-center group-hover:text-primary transition-colors line-clamp-1">{category.name}</span>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">No categories found.</p>
        )}
      </section>

      {/* Featured / Trending Products */}
      <SectionErrorBoundary fallbackTitle="Featured products unavailable">
        <section className="container py-8 sm:py-12 border-t border-border/50 px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 sm:mb-10 gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold mb-2">
                <Sparkles className="h-3.5 w-3.5" /> Handpicked
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight mb-1 sm:mb-2">Trending Now</h2>
              <p className="text-muted-foreground text-xs sm:text-base">The most popular items this week.</p>
            </div>
            <Link href="/products" className="text-primary font-semibold hover:underline flex items-center gap-1 group text-xs sm:text-sm">
              View All Products <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
          
          {isLoadingProducts ? (
            <ProductGridSkeleton count={8} />
          ) : productsData?.pages[0]?.data.length ? (
            <ProductGrid>
              {productsData.pages[0].data.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </ProductGrid>
          ) : (
            <EmptyState
              icon={<ShoppingBag />}
              title="No products available"
              description="We're currently restocking our inventory. Check back soon!"
              action={
                <Link href="/products" className={buttonVariants({ variant: "outline", className: "rounded-full" })}>Browse Catalog</Link>
              }
            />
          )}
        </section>
      </SectionErrorBoundary>

      {/* Recently Viewed Section */}
      <SectionErrorBoundary fallbackTitle="Recently viewed items unavailable">
        <RecentlyViewedSection />
      </SectionErrorBoundary>

      {/* Newsletter Section */}
      <SectionErrorBoundary fallbackTitle="Newsletter signup unavailable">
        <NewsletterSection />
      </SectionErrorBoundary>
    </div>
  );
}
