"use client";

import { useSearchParams, useRouter } from 'next/navigation';
import { ShoppingBag, SlidersHorizontal, Loader2, X, Sparkles, ArrowUpDown } from 'lucide-react';
import { buttonVariants, Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { CatalogFilters } from '@/components/storefront/catalog-filters';
import { ProductGrid, ProductGridSkeleton } from '@/components/storefront/product-grid';
import { ProductCard } from '@/components/storefront/product-card';
import { EmptyState } from '@/components/shared/empty-state';
import { useProducts, useCategories } from '@/hooks/use-catalog';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { useEffect, Suspense, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { Breadcrumbs } from '@/components/shared/breadcrumbs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

function ProductsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const currentCategory = searchParams.get('category') || undefined;
  const currentSort = searchParams.get('sort') || 'featured';

  const filters = {
    q: searchParams.get('q') || undefined,
    category: currentCategory,
    brand: searchParams.get('brand') || undefined,
    minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
    maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
    limit: 12,
  };

  const { data: categories } = useCategories();

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
  let products = data?.pages.flatMap(page => page.data) || [];

  // Client-side sort if applied
  if (currentSort === 'price-low') {
    products = [...products].sort((a, b) => parseFloat(a.basePrice) - parseFloat(b.basePrice));
  } else if (currentSort === 'price-high') {
    products = [...products].sort((a, b) => parseFloat(b.basePrice) - parseFloat(a.basePrice));
  } else if (currentSort === 'newest') {
    products = [...products].sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  }

  const handleSortChange = (sortKey: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('sort', sortKey);
    router.push(`/products?${params.toString()}`);
  };

  const handleClearFilters = () => {
    router.push('/products');
  };

  const handleRemoveFilter = (key: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete(key);
    router.push(`/products?${params.toString()}`);
  };

  const hasActiveFilters = Boolean(
    filters.q || filters.category || filters.brand || filters.minPrice || filters.maxPrice
  );

  const sortLabels: Record<string, string> = {
    featured: 'Featured',
    'price-low': 'Price: Low to High',
    'price-high': 'Price: High to Low',
    newest: 'Newest Arrivals',
  };

  return (
    <div className="container max-w-7xl mx-auto py-6 sm:py-8 px-4 sm:px-6">
      <Breadcrumbs items={[{ label: 'Products' }]} className="mb-4 sm:mb-6" />

      {/* Header and Controls */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
              All Products
            </h1>
            {filters.q ? (
              <p className="text-muted-foreground mt-0.5 text-xs sm:text-sm">
                Showing results for <span className="font-bold text-foreground">&quot;{filters.q}&quot;</span>
              </p>
            ) : (
              <p className="text-muted-foreground mt-0.5 text-xs sm:text-sm">
                Explore our curated catalog with authentic quality guaranteed.
              </p>
            )}
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {/* Sort Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger render={<Button variant="outline" size="sm" className="h-9 rounded-full text-xs font-semibold gap-1.5 border-border/80" />}>
                <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Sort: {sortLabels[currentSort] || 'Featured'}</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 p-1.5 rounded-2xl shadow-xl">
                <DropdownMenuItem className="text-xs font-semibold py-2 rounded-xl cursor-pointer" onClick={() => handleSortChange('featured')}>
                  Featured
                </DropdownMenuItem>
                <DropdownMenuItem className="text-xs font-semibold py-2 rounded-xl cursor-pointer" onClick={() => handleSortChange('price-low')}>
                  Price: Low to High
                </DropdownMenuItem>
                <DropdownMenuItem className="text-xs font-semibold py-2 rounded-xl cursor-pointer" onClick={() => handleSortChange('price-high')}>
                  Price: High to Low
                </DropdownMenuItem>
                <DropdownMenuItem className="text-xs font-semibold py-2 rounded-xl cursor-pointer" onClick={() => handleSortChange('newest')}>
                  Newest Arrivals
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Filter Sheet Trigger */}
            <div className="md:hidden">
              <Sheet>
                <SheetTrigger render={<Button variant="outline" size="sm" className="h-9 rounded-full text-xs font-semibold gap-1.5 border-border/80" />}>
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  <span>Filters</span>
                  {hasActiveFilters && (
                    <span className="h-2 w-2 rounded-full bg-primary" />
                  )}
                </SheetTrigger>
                <SheetContent side="left" className="w-full sm:max-w-md overflow-y-auto p-6">
                  <SheetHeader className="mb-6 text-left">
                    <SheetTitle className="text-lg font-bold">Filter Products</SheetTitle>
                  </SheetHeader>
                  <CatalogFilters />
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>

        {/* Category Horizontal Quick Filter Chips */}
        {categories && categories.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <Link
              href="/products"
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                !currentCategory
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'bg-secondary/60 text-muted-foreground hover:text-foreground hover:bg-secondary'
              }`}
            >
              All Items
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/products?category=${cat.slug}`}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                  currentCategory === cat.slug
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'bg-secondary/60 text-muted-foreground hover:text-foreground hover:bg-secondary'
                }`}
              >
                {cat.name}
              </Link>
            ))}
          </div>
        )}

        {/* Active Filter Chips */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-border/40">
            <span className="text-xs font-bold text-muted-foreground">Active:</span>
            {filters.q && (
              <Badge variant="secondary" className="gap-1.5 text-xs py-1 px-2.5 rounded-full font-medium">
                Search: &quot;{filters.q}&quot;
                <button type="button" onClick={() => handleRemoveFilter('q')} className="hover:text-destructive">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {filters.category && (
              <Badge variant="secondary" className="gap-1.5 text-xs py-1 px-2.5 rounded-full font-medium">
                Category: {filters.category}
                <button type="button" onClick={() => handleRemoveFilter('category')} className="hover:text-destructive">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {filters.brand && (
              <Badge variant="secondary" className="gap-1.5 text-xs py-1 px-2.5 rounded-full font-medium">
                Brand: {filters.brand}
                <button type="button" onClick={() => handleRemoveFilter('brand')} className="hover:text-destructive">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {(filters.minPrice || filters.maxPrice) && (
              <Badge variant="secondary" className="gap-1.5 text-xs py-1 px-2.5 rounded-full font-medium">
                Price: ${filters.minPrice ?? 0} - ${filters.maxPrice ?? 'Max'}
                <button type="button" onClick={() => { handleRemoveFilter('minPrice'); handleRemoveFilter('maxPrice'); }} className="hover:text-destructive">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            <button
              type="button"
              onClick={handleClearFilters}
              className="text-xs font-bold text-primary hover:underline ml-1"
            >
              Clear All
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-6 sm:gap-8">
        {/* Desktop Filters Sidebar */}
        <aside className="hidden md:block col-span-1 border-r border-border/50 pr-6">
          <div className="sticky top-24">
            <CatalogFilters />
          </div>
        </aside>

        {/* Product Grid Area */}
        <div className="col-span-1 md:col-span-3 lg:col-span-4 flex flex-col gap-6">
          {isLoading ? (
            <ProductGridSkeleton count={8} />
          ) : isError ? (
            <div className="p-8 text-center bg-card rounded-2xl border border-destructive/20 text-destructive">
              Failed to load products. Please check your connection and try again.
            </div>
          ) : products.length === 0 ? (
            <EmptyState
              icon={<ShoppingBag />}
              title="No products found"
              description="Try adjusting your search criteria or clearing active filters."
              action={
                <Button variant="outline" className="rounded-full" onClick={handleClearFilters}>
                  Clear All Filters
                </Button>
              }
            />
          ) : (
            <>
              <ProductGrid>
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </ProductGrid>

              {/* Infinite Scroll Trigger */}
              <div ref={ref} className="py-8 flex justify-center w-full">
                {isFetchingNextPage && (
                  <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    Loading more products...
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="container max-w-7xl mx-auto py-8 px-4">
        <ProductGridSkeleton count={8} />
      </div>
    }>
      <ProductsPageContent />
    </Suspense>
  );
}
