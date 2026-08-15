"use client";

import { useSearchParams } from 'next/navigation';
import { ShoppingBag, SlidersHorizontal, Loader2 } from 'lucide-react';
import { buttonVariants, Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { CatalogFilters } from '@/components/storefront/catalog-filters';
import { ProductGrid, ProductGridSkeleton } from '@/components/storefront/product-grid';
import { ProductCard } from '@/components/storefront/product-card';
import { EmptyState } from '@/components/shared/empty-state';
import { useProducts } from '@/hooks/use-catalog';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { useEffect, Suspense } from 'react';
import { useInView } from 'react-intersection-observer';

function ProductsPageContent() {
  const searchParams = useSearchParams();
  
  const filters = {
    q: searchParams.get('q') || undefined,
    category: searchParams.get('category') || undefined,
    brand: searchParams.get('brand') || undefined,
    minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
    maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
    limit: 12,
  };

  const { 
    data, 
    isLoading, 
    isError, 
    fetchNextPage, 
    hasNextPage, 
    isFetchingNextPage 
  } = useProducts(filters);

  const { ref, inView } = useInView();

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Flatten infinite query pages
  const products = data?.pages.flatMap(page => page.data) || [];

  return (
    <div className="container py-8">
      {/* Header and Mobile Filter */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Shop&quot;Smart&quot; Catalog</h1>
          {filters.q && (
            <p className="text-muted-foreground mt-2">
              Showing results for <span className="font-semibold text-foreground">&quot;{filters.q}&quot;</span>
            </p>
          )}
        </div>

        <div className="md:hidden">
          <Sheet>
            <SheetTrigger render={<Button variant="outline" className="w-full sm:w-auto" />}>
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              Filters
            </SheetTrigger>
            <SheetContent side="left" className="w-full sm:max-w-md overflow-y-auto">
              <SheetHeader className="mb-6">
                <SheetTitle>Filters</SheetTitle>
              </SheetHeader>
              <CatalogFilters />
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-8">
        {/* Desktop Sidebar */}
        <aside className="hidden md:block col-span-1 border-r pr-8">
          <div className="sticky top-24">
            <CatalogFilters />
          </div>
        </aside>

        {/* Product Grid */}
        <div className="col-span-1 md:col-span-3 lg:col-span-4 flex flex-col gap-6">
          {/* Active Filters Badges */}
          {(filters.category || filters.brand || filters.minPrice || filters.maxPrice) && (
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-sm text-muted-foreground mr-2">Active filters:</span>
              {filters.category && <Badge variant="secondary">Category: {filters.category}</Badge>}
              {filters.brand && <Badge variant="secondary">Brand: {filters.brand}</Badge>}
              {(filters.minPrice || filters.maxPrice) && (
                <Badge variant="secondary">
                  Price: {filters.minPrice ? `$${filters.minPrice}` : '$0'} - {filters.maxPrice ? `$${filters.maxPrice}` : 'Max'}
                </Badge>
              )}
            </div>
          )}

          {isLoading ? (
            <ProductGridSkeleton count={12} />
          ) : isError ? (
            <EmptyState
              title="Error loading products"
              description="There was a problem fetching the products. Please try again later."
              action={<Button onClick={() => window.location.reload()}>Retry</Button>}
            />
          ) : products.length > 0 ? (
            <>
              <ProductGrid>
                {products.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </ProductGrid>
              
              {/* Load More Trigger */}
              <div ref={ref} className="py-8 flex justify-center">
                {isFetchingNextPage ? (
                  <div className="flex items-center text-muted-foreground">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading more...
                  </div>
                ) : hasNextPage ? (
                  <Button variant="outline" onClick={() => fetchNextPage()}>Load More</Button>
                ) : (
                  <p className="text-muted-foreground text-sm">You&apos;ve reached the end of the list.</p>
                )}
              </div>
            </>
          ) : (
            <EmptyState
              icon={<ShoppingBag />}
              title="No products found"
              description="We couldn't find any products matching your current filters."
              action={
                <Link href="/products" className={buttonVariants({ variant: "outline" })}>
                  Clear all filters
                </Link>
              }
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="container py-8">
        <ProductGridSkeleton />
      </div>
    }>
      <ProductsPageContent />
    </Suspense>
  );
}
