"use client";

import Link from 'next/link';
import { ArrowRight, ShoppingBag } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProductCard } from '@/components/storefront/product-card';
import { ProductGrid, ProductGridSkeleton } from '@/components/storefront/product-grid';
import { useBanners, useCategories, useProducts } from '@/hooks/use-catalog';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/empty-state';

export default function HomePage() {
  const { data: banners, isLoading: isLoadingBanners } = useBanners();
  const { data: categories, isLoading: isLoadingCategories } = useCategories();
  const { data: productsData, isLoading: isLoadingProducts } = useProducts({ limit: 8 });

  const activeBanner = banners && banners.length > 0 ? banners[0] : null;

  return (
    <div className="flex flex-col gap-12 pb-12">
      {/* Hero Section */}
      <section className="relative bg-muted overflow-hidden">
        {isLoadingBanners ? (
          <Skeleton className="w-full h-[500px]" />
        ) : activeBanner ? (
          <div className="relative w-full h-[400px] md:h-[500px] lg:h-[600px] flex items-center bg-zinc-900">
            {/* The backend provides imageUrl but due to Phase 4 mock/limitations, we use it directly or fallback */}
            <div 
              className="absolute inset-0 z-0 opacity-40 bg-cover bg-center"
              style={{ backgroundImage: `url(${activeBanner.imageUrl})` }}
            />
            <div className="container relative z-10 flex flex-col items-start justify-center text-white">
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4 max-w-2xl leading-tight">
                Discover Your Next Favorite Thing
              </h1>
              <p className="text-lg md:text-xl text-zinc-300 mb-8 max-w-lg">
                Browse our latest arrivals and find the perfect addition to your life&apos;s journey.
              </p>
              {activeBanner.linkUrl ? (
                <Link href={activeBanner.linkUrl} className={buttonVariants({ size: "lg", className: "text-md h-12 px-8" })}>
                  Shop Now <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              ) : (
                <Link href="/products" className={buttonVariants({ size: "lg", className: "text-md h-12 px-8" })}>
                  Explore Catalog <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              )}
            </div>
          </div>
        ) : (
          // Fallback Hero if no banners are returned from backend
          <div className="relative w-full h-[400px] md:h-[500px] flex items-center bg-gradient-to-tr from-primary/10 via-primary/5 to-background">
            <div className="container flex flex-col items-start justify-center">
              <Badge className="mb-4 bg-primary/20 text-primary hover:bg-primary/20 pointer-events-none">New Arrivals</Badge>
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4 max-w-2xl leading-tight text-foreground">
                Welcome to ShopSmart
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-lg">
                The intelligent way to shop online. Get the best products at the smartest prices.
              </p>
              <Link href="/products" className={buttonVariants({ size: "lg", className: "text-md h-12 px-8" })}>
                Shop Now <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
        )}
      </section>

      {/* Featured Categories */}
      <section className="container">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold tracking-tight">Shop by Category</h2>
          <Link href="/categories" className={buttonVariants({ variant: "ghost" })}>View All</Link>
        </div>
        
        {isLoadingCategories ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-xl" />
            ))}
          </div>
        ) : categories && categories.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {categories.slice(0, 6).map((category) => (
              <Link 
                key={category.id} 
                href={`/products?category=${category.slug}`}
                className="group flex flex-col items-center justify-center gap-3 p-6 rounded-xl border bg-card hover:bg-accent hover:text-accent-foreground transition-all hover:shadow-md"
              >
                <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                  <ShoppingBag className="h-6 w-6" />
                </div>
                <span className="font-medium text-sm text-center">{category.name}</span>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">No categories found.</p>
        )}
      </section>

      {/* Recently Added Products */}
      <section className="container">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold tracking-tight">New Arrivals</h2>
          <Link href="/products" className={buttonVariants({ variant: "ghost" })}>View All Products</Link>
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
              <Link href="/products" className={buttonVariants({ variant: "outline" })}>Browse Catalog</Link>
            }
          />
        )}
      </section>
    </div>
  );
}
