"use client";

import { useSearchParams, useRouter } from 'next/navigation';
import { ShoppingBag, SlidersHorizontal, Loader2, X, Sparkles, ArrowUpDown, ChevronDown } from 'lucide-react';
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
    sort: currentSort,
    limit: 24,
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
    discount: 'Discount (High to Low)',
  };

  // Determine category heading title
  const activeCategoryObj = categories?.find(c => c.slug === currentCategory);
  const pageTitle = activeCategoryObj ? activeCategoryObj.name.toUpperCase() : 'MEN\'S CASUAL & FORMAL APPAREL';

  return (
    <div className="container max-w-7xl mx-auto py-6 sm:py-8 px-4 sm:px-6">
      <Breadcrumbs items={[
        { label: 'Collection', href: '/products' },
        ...(activeCategoryObj ? [{ label: activeCategoryObj.name, href: `/products?category=${activeCategoryObj.slug}` }] : []),
      ]} className="mb-4 sm:mb-6" />

      {/* Collection Banner / Title Header */}
      <div className="flex flex-col gap-4 mb-6 pb-4 border-b border-border/40">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <span className="text-[11px] font-black text-primary uppercase tracking-widest">
              Collection
            </span>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-foreground uppercase">
              {pageTitle}
            </h1>
            <p className="text-muted-foreground mt-1 text-xs sm:text-sm max-w-xl">
              {activeCategoryObj 
                ? `Explore our refined selection of ${activeCategoryObj.name.toLowerCase()} tailored with fine fabrics and modern cuts.`
                : 'Premium shirts, trousers, and modern fashion designed for effortless confidence.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {isLoading ? (
              <div className="h-7 w-24 bg-secondary/80 animate-pulse rounded-full" />
            ) : (
              <span className="text-xs font-bold text-muted-foreground bg-secondary/80 px-3 py-1.5 rounded-full whitespace-nowrap">
                {products.length} {products.length === 1 ? 'Product' : 'Products'}
              </span>
            )}
          </div>
        </div>

        {/* Mobile Filter & Sort Bar (Sticky/Prominent) */}
        <div className="flex sm:hidden items-center gap-2 pt-2">
          {/* Mobile Filter Sheet */}
          <div className="flex-1">
            <Sheet>
              <SheetTrigger render={<Button variant="outline" className="w-full h-10 rounded-xl text-xs font-bold gap-2 border-border/80 justify-center shadow-2xs" />}>
                <SlidersHorizontal className="h-4 w-4 text-primary" />
                <span>Filter</span>
                {hasActiveFilters && (
                  <span className="h-2 w-2 rounded-full bg-primary" />
                )}
              </SheetTrigger>
              <SheetContent side="left" className="w-full sm:max-w-md overflow-y-auto p-6">
                <SheetHeader className="mb-6 text-left">
                  <SheetTitle className="text-lg font-black uppercase tracking-tight">Filter Collection</SheetTitle>
                </SheetHeader>
                <CatalogFilters />
              </SheetContent>
            </Sheet>
          </div>

          {/* Mobile Sort Dropdown */}
          <div className="flex-1">
            <DropdownMenu>
              <DropdownMenuTrigger render={<Button variant="outline" className="w-full h-10 rounded-xl text-xs font-bold gap-2 border-border/80 justify-center shadow-2xs" />}>
                <ArrowUpDown className="h-3.5 w-3.5 text-primary" />
                <span className="truncate">Sort: {sortLabels[currentSort] || 'Featured'}</span>
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground ml-auto" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52 p-2 rounded-2xl shadow-xl">
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
          </div>
        </div>

        {/* Desktop Quick Category Chips */}
        {categories && categories.length > 0 && (
          <div className="hidden sm:flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none pt-2">
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
            {categories
              .filter(c => !['men', 'women', 'kids', 'collections'].includes(c.slug))
              .map((cat) => (
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

        {/* Active Filter Badges */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 pt-2">
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
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleClearFilters}
              className="text-xs h-7 px-2 text-destructive hover:bg-destructive/10 rounded-full font-semibold"
            >
              Reset all
            </Button>
          </div>
        )}
      </div>

      {/* Main Catalog Body: Desktop Sidebar Filter + Product Grid */}
      <div className="flex gap-8 items-start">
        {/* Desktop Sidebar (Left) */}
        <aside className="hidden md:block w-60 lg:w-64 shrink-0 sticky top-24">
          <CatalogFilters />
        </aside>

        {/* Product Grid Area (Right) */}
        <main className="flex-1 min-w-0">
          {/* Desktop Sort Header */}
          <div className="hidden sm:flex items-center justify-between mb-4 pb-2">
            <span className="text-xs font-semibold text-muted-foreground">
              {isLoading ? 'Loading catalog products...' : `Showing ${products.length} ${products.length === 1 ? 'result' : 'results'}`}
            </span>

            <DropdownMenu>
              <DropdownMenuTrigger render={<Button variant="outline" size="sm" className="h-9 px-3.5 rounded-full text-xs font-semibold gap-2 border-border/80 hover:bg-secondary" />}>
                <ArrowUpDown className="h-3.5 w-3.5 text-primary" />
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
          </div>

          {isLoading ? (
            <ProductGridSkeleton count={8} />
          ) : isError ? (
            <EmptyState
              icon={<ShoppingBag />}
              title="Error loading collection"
              description="Failed to retrieve products. Please check your internet connection."
              action={
                <Button onClick={() => window.location.reload()} variant="outline" className="rounded-full">
                  Retry
                </Button>
              }
            />
          ) : products.length === 0 ? (
            <EmptyState
              icon={<ShoppingBag />}
              title="No products found"
              description="We couldn't find any products matching your selected filters. Try broadening your criteria."
              action={
                <Button onClick={handleClearFilters} className="rounded-full">
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
              {hasNextPage && (
                <div ref={ref} className="py-12 flex justify-center items-center">
                  {isFetchingNextPage ? (
                    <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground bg-secondary/80 px-4 py-2 rounded-full">
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      <span>Loading more styles...</span>
                    </div>
                  ) : (
                    <Button 
                      variant="outline" 
                      onClick={() => fetchNextPage()}
                      className="rounded-full px-6 font-bold text-xs"
                    >
                      Load More Products
                    </Button>
                  )}
                </div>
              )}
            </>
          )}
        </main>
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
