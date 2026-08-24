"use client";

import { useSearchParams, useRouter } from 'next/navigation';
import { 
  ShoppingBag, SlidersHorizontal, Loader2, X, Sparkles, 
  ArrowUpDown, ChevronDown, Flame, RotateCcw, Truck, 
  ShieldCheck, Scissors, Layers, CheckCircle2 
} from 'lucide-react';
import { buttonVariants, Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { CatalogFilters } from '@/components/storefront/catalog-filters';
import { ProductGrid, ProductGridSkeleton } from '@/components/storefront/product-grid';
import { ProductCard } from '@/components/storefront/product-card';
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
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  
  const currentCategory = searchParams.get('category') || undefined;
  const currentSort = searchParams.get('sort') || 'featured';
  const searchQuery = searchParams.get('q') || undefined;

  const filters = {
    q: searchQuery,
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
    filters.q || filters.category || filters.brand || filters.minPrice || filters.maxPrice || searchParams.get('size')
  );

  const sortLabels: Record<string, string> = {
    featured: 'Featured',
    'price-low': 'Price: Low to High',
    'price-high': 'Price: High to Low',
    newest: 'Newest Drops',
  };

  // Determine category heading title
  const activeCategoryObj = categories?.find(c => c.slug === currentCategory);
  
  let pageTitle = 'SHOP ALL';
  let pageDescription = 'Premium anime-inspired graphics, oversized silhouettes and statement pieces designed to be worn your way.';
  
  if (searchQuery) {
    pageTitle = `SEARCH: "${searchQuery.toUpperCase()}"`;
    pageDescription = `Displaying matching streetwear pieces from the ASORA catalog.`;
  } else if (activeCategoryObj) {
    pageTitle = activeCategoryObj.name.toUpperCase();
    if (activeCategoryObj.slug === 'anime-collection') {
      pageDescription = 'Cyberpunk, shonen legends and dark aesthetic anime apparel.';
    } else if (activeCategoryObj.slug === 'oversized-t-shirts') {
      pageDescription = 'Heavyweight 240+ GSM drop-shoulder boxy silhouettes.';
    } else if (activeCategoryObj.slug === 'graphic-prints') {
      pageDescription = 'Bold high-density back artwork and front chest hits.';
    } else if (activeCategoryObj.slug === 'custom-t-shirts') {
      pageDescription = 'Your design. Your fit. Your story. Custom printed on heavyweight cotton.';
    } else if (activeCategoryObj.slug === 'new-drops') {
      pageDescription = 'Fresh limited-run designs and latest seasonal releases.';
    }
  }

  // Quick navigation pill tabs
  const quickCategories = [
    { label: 'ALL', href: '/products', active: !currentCategory && !searchQuery },
    { label: 'ANIME', href: '/products?category=anime-collection', active: currentCategory === 'anime-collection' },
    { label: 'OVERSIZED', href: '/products?category=oversized-t-shirts', active: currentCategory === 'oversized-t-shirts' },
    { label: 'GRAPHIC PRINTS', href: '/products?category=graphic-prints', active: currentCategory === 'graphic-prints' },
    { label: 'MINIMAL', href: '/products?category=minimal-collection', active: currentCategory === 'minimal-collection' },
    { label: 'CUSTOM STUDIO ✂', href: '/customizer', active: false },
    { label: 'NEW DROPS 🔥', href: '/products?category=new-drops', active: currentCategory === 'new-drops' },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="container max-w-7xl mx-auto py-6 sm:py-10 px-4 sm:px-6 space-y-6 sm:space-y-8">
        
        {/* Breadcrumbs */}
        <Breadcrumbs items={[
          { label: 'HOME', href: '/' },
          { label: 'THE COLLECTION', href: '/products' },
          ...(activeCategoryObj ? [{ label: activeCategoryObj.name.toUpperCase(), href: `/products?category=${activeCategoryObj.slug}` }] : []),
        ]} className="text-zinc-500 font-mono text-[11px]" />

        {/* ── 1. EDITORIAL SHOP HEADER ─────────────────────────────── */}
        <div className="border-b border-zinc-850 pb-6 sm:pb-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-rose-500 text-[10px] sm:text-[11px] font-mono font-bold tracking-widest uppercase">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
                <span>ASORA / THE COLLECTION</span>
              </div>
              
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-zinc-100 uppercase">
                {pageTitle}
              </h1>

              <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl leading-relaxed">
                {pageDescription}
              </p>
            </div>

            {/* Product Count Pill */}
            <div className="flex items-center gap-2 self-start sm:self-end">
              {isLoading ? (
                <div className="h-8 w-24 bg-zinc-900 border border-zinc-800 animate-pulse rounded" />
              ) : (
                <span className="text-xs font-mono font-bold text-zinc-300 bg-zinc-900 border border-zinc-800 px-3.5 py-1.5 rounded whitespace-nowrap uppercase tracking-wider">
                  {products.length} {products.length === 1 ? 'PIECE' : 'PIECES'}
                </span>
              )}
            </div>
          </div>

          {/* ── 2. HORIZONTAL CATEGORY NAVIGATION ──────────────────── */}
          <div className="mt-6 pt-4 border-t border-zinc-850/60 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {quickCategories.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`px-4 py-2 rounded text-xs font-mono font-bold whitespace-nowrap transition-all uppercase tracking-wider ${
                  item.active
                    ? 'bg-rose-600 text-white shadow-lg shadow-rose-950/40'
                    : 'bg-zinc-900/90 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-850 border border-zinc-800'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Active Filter Tags */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 pt-4">
              <span className="text-xs font-mono font-bold text-zinc-500 uppercase">ACTIVE:</span>
              {filters.q && (
                <Badge variant="secondary" className="gap-1.5 text-xs font-mono py-1 px-3 rounded bg-zinc-900 border border-zinc-800 text-zinc-200">
                  Search: &quot;{filters.q}&quot;
                  <button type="button" onClick={() => handleRemoveFilter('q')} className="hover:text-rose-400">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {filters.category && (
                <Badge variant="secondary" className="gap-1.5 text-xs font-mono py-1 px-3 rounded bg-zinc-900 border border-zinc-800 text-zinc-200">
                  Category: {filters.category}
                  <button type="button" onClick={() => handleRemoveFilter('category')} className="hover:text-rose-400">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {filters.minPrice && (
                <Badge variant="secondary" className="gap-1.5 text-xs font-mono py-1 px-3 rounded bg-zinc-900 border border-zinc-800 text-zinc-200">
                  Min: PKR {filters.minPrice}
                  <button type="button" onClick={() => handleRemoveFilter('minPrice')} className="hover:text-rose-400">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {filters.maxPrice && (
                <Badge variant="secondary" className="gap-1.5 text-xs font-mono py-1 px-3 rounded bg-zinc-900 border border-zinc-800 text-zinc-200">
                  Max: PKR {filters.maxPrice}
                  <button type="button" onClick={() => handleRemoveFilter('maxPrice')} className="hover:text-rose-400">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleClearFilters}
                className="text-xs font-mono font-bold h-7 px-2 text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 rounded"
              >
                CLEAR ALL
              </Button>
            </div>
          )}
        </div>

        {/* ── 3. FILTER + SORT BAR & MAIN BODY ──────────────────────── */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* Desktop Sidebar Filters (Left) */}
          <aside className="hidden lg:block w-64 shrink-0 sticky top-20 self-start max-h-[calc(100vh-6rem)] overflow-y-auto scrollbar-thin rounded-md">
            <CatalogFilters />
          </aside>

          {/* Product Grid Area (Right) */}
          <main className="flex-1 min-w-0 w-full space-y-6">
            
            {/* Customizer Callout Banner */}
            {currentCategory === 'custom-t-shirts' && (
              <div className="p-6 rounded-md bg-gradient-to-r from-zinc-900 via-zinc-900 to-rose-950/40 border border-rose-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1 text-left">
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-rose-600/10 border border-rose-500/20 text-rose-400 text-[10px] font-mono font-bold uppercase tracking-widest">
                    <Scissors className="h-3 w-3" /> ASORA CUSTOM STUDIO
                  </div>
                  <h3 className="text-base sm:text-lg font-black uppercase text-zinc-100">
                    Design Your Own Custom Heavyweight T-Shirt
                  </h3>
                  <p className="text-xs font-mono text-zinc-400">
                    Upload your artwork, select placement (Front, Back, Front+Back), pick oversized 240+ GSM fit, and preview live.
                  </p>
                </div>
                <Link
                  href="/customizer"
                  className={buttonVariants({
                    className: "bg-rose-600 hover:bg-rose-700 text-white font-mono font-bold text-xs uppercase px-5 h-10 rounded shadow-xl shrink-0 gap-2",
                  })}
                >
                  <Scissors className="h-4 w-4" />
                  <span>START CUSTOMIZING NOW</span>
                </Link>
              </div>
            )}

            {/* Controls Bar */}
            <div className="flex items-center justify-between gap-3 p-3 rounded-md bg-zinc-900/60 border border-zinc-800">
              
              {/* Mobile Filter Sheet Trigger */}
              <div className="block lg:hidden flex-1">
                <Sheet open={mobileFilterOpen} onOpenChange={setMobileFilterOpen}>
                  <SheetTrigger render={<Button variant="outline" className="w-full h-10 rounded bg-zinc-950 border-zinc-800 text-zinc-200 text-xs font-mono font-bold gap-2 justify-center hover:bg-zinc-900" />}>
                    <SlidersHorizontal className="h-4 w-4 text-rose-500" />
                    <span>FILTERS</span>
                    {hasActiveFilters && (
                      <span className="h-2 w-2 rounded-full bg-rose-500" />
                    )}
                  </SheetTrigger>
                  <SheetContent side="left" className="w-full sm:max-w-md overflow-y-auto p-6 bg-zinc-950 border-zinc-800 text-zinc-100">
                    <SheetHeader className="mb-6 text-left">
                      <SheetTitle className="text-lg font-black uppercase tracking-tight text-zinc-100 font-mono">
                        FILTER COLLECTION
                      </SheetTitle>
                    </SheetHeader>
                    <CatalogFilters onFilterApplied={() => setMobileFilterOpen(false)} />
                  </SheetContent>
                </Sheet>
              </div>

              {/* Status / Results Count */}
              <div className="hidden sm:block text-xs font-mono text-zinc-400">
                {isLoading ? (
                  <span>LOADING STREETWEAR PIECES...</span>
                ) : (
                  <span>SHOWING {products.length} {products.length === 1 ? 'RESULT' : 'RESULTS'}</span>
                )}
              </div>

              {/* Sort Dropdown */}
              <div className="flex-1 sm:flex-none">
                <DropdownMenu>
                  <DropdownMenuTrigger render={<Button variant="outline" size="sm" className="w-full sm:w-auto h-10 sm:h-9 px-4 rounded bg-zinc-950 border-zinc-800 text-zinc-200 hover:bg-zinc-900 text-xs font-mono font-bold gap-2 justify-between sm:justify-center" />}>
                    <ArrowUpDown className="h-3.5 w-3.5 text-rose-500" />
                    <span>SORT: {sortLabels[currentSort] || 'Featured'}</span>
                    <ChevronDown className="h-3.5 w-3.5 text-zinc-500 ml-auto sm:ml-2" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52 p-1.5 rounded-md bg-zinc-950 border-zinc-800 text-zinc-200 shadow-2xl">
                    <DropdownMenuItem className="text-xs font-mono font-medium py-2 rounded hover:bg-zinc-900 cursor-pointer" onClick={() => handleSortChange('featured')}>
                      Featured
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-xs font-mono font-medium py-2 rounded hover:bg-zinc-900 cursor-pointer" onClick={() => handleSortChange('price-low')}>
                      Price: Low to High
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-xs font-mono font-medium py-2 rounded hover:bg-zinc-900 cursor-pointer" onClick={() => handleSortChange('price-high')}>
                      Price: High to Low
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-xs font-mono font-medium py-2 rounded hover:bg-zinc-900 cursor-pointer" onClick={() => handleSortChange('newest')}>
                      Newest Drops
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

            </div>

            {/* Product Grid / States */}
            {isLoading ? (
              <ProductGridSkeleton count={8} />
            ) : isError ? (
              <div className="p-12 text-center rounded-md bg-zinc-900/50 border border-zinc-800 space-y-4 max-w-lg mx-auto">
                <div className="h-12 w-12 rounded-full bg-rose-600/10 text-rose-500 border border-rose-500/20 flex items-center justify-center mx-auto">
                  <ShoppingBag className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-black text-zinc-100 uppercase tracking-tight font-mono">
                  SOMETHING WENT WRONG.
                </h3>
                <p className="text-xs text-zinc-400">
                  We couldn&apos;t load this collection right now. Please try again.
                </p>
                <Button 
                  onClick={() => window.location.reload()} 
                  className="bg-rose-600 hover:bg-rose-700 text-white font-mono font-bold text-xs uppercase px-6 h-10 rounded"
                >
                  TRY AGAIN
                </Button>
              </div>
            ) : products.length === 0 ? (
              <div className="p-12 text-center rounded-md bg-zinc-900/50 border border-zinc-800 space-y-4 max-w-lg mx-auto">
                <div className="h-12 w-12 rounded-full bg-zinc-850 text-zinc-400 border border-zinc-750 flex items-center justify-center mx-auto">
                  <ShoppingBag className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-black text-zinc-100 uppercase tracking-tight font-mono">
                  NOTHING HERE YET.
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  We couldn&apos;t find any pieces matching your selected filters. Try another collection or clear your filters.
                </p>
                <div className="flex flex-col sm:flex-row gap-2 justify-center pt-2">
                  <Button 
                    onClick={handleClearFilters} 
                    className="bg-rose-600 hover:bg-rose-700 text-white font-mono font-bold text-xs uppercase px-6 h-10 rounded"
                  >
                    CLEAR FILTERS
                  </Button>
                  <Link
                    href="/products"
                    className={buttonVariants({
                      variant: "outline",
                      className: "border-zinc-800 bg-zinc-900 text-zinc-200 font-mono font-bold text-xs uppercase px-6 h-10 rounded",
                    })}
                  >
                    EXPLORE ALL
                  </Link>
                </div>
              </div>
            ) : (
              <>
                <ProductGrid>
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </ProductGrid>

                {/* Infinite Scroll / Load More Trigger */}
                {hasNextPage && (
                  <div ref={ref} className="py-12 flex justify-center items-center">
                    {isFetchingNextPage ? (
                      <div className="flex items-center gap-2 text-xs font-mono font-bold text-zinc-400 bg-zinc-900 border border-zinc-800 px-5 py-2.5 rounded">
                        <Loader2 className="h-4 w-4 animate-spin text-rose-500" />
                        <span>LOADING MORE PIECES...</span>
                      </div>
                    ) : (
                      <Button 
                        variant="outline" 
                        onClick={() => fetchNextPage()}
                        className="rounded border-zinc-800 bg-zinc-900 hover:bg-zinc-850 text-zinc-200 font-mono font-bold text-xs uppercase tracking-wider px-8 h-11"
                      >
                        LOAD MORE PIECES
                      </Button>
                    )}
                  </div>
                )}
              </>
            )}

          </main>
        </div>

        {/* ── 4. BOTTOM EDITORIAL TRUST STRIP ──────────────────────── */}
        <div className="mt-16 pt-8 border-t border-zinc-850 grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
          <div className="p-4 rounded bg-zinc-900/40 border border-zinc-850 space-y-1">
            <div className="text-xs font-mono font-bold text-zinc-100 uppercase">240+ GSM COTTON</div>
            <div className="text-[11px] text-zinc-400">Heavyweight Combed Fabric</div>
          </div>
          <div className="p-4 rounded bg-zinc-900/40 border border-zinc-850 space-y-1">
            <div className="text-xs font-mono font-bold text-zinc-100 uppercase">HIGH-DENSITY INK</div>
            <div className="text-[11px] text-zinc-400">Fade-Proof HD Artwork</div>
          </div>
          <div className="p-4 rounded bg-zinc-900/40 border border-zinc-850 space-y-1">
            <div className="text-xs font-mono font-bold text-zinc-100 uppercase">CASH ON DELIVERY</div>
            <div className="text-[11px] text-zinc-400">Safe Doorstep Payment</div>
          </div>
          <div className="p-4 rounded bg-zinc-900/40 border border-zinc-850 space-y-1">
            <div className="text-xs font-mono font-bold text-zinc-100 uppercase">NATIONWIDE DELIVERY</div>
            <div className="text-[11px] text-zinc-400">Delivered Across Pakistan</div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-zinc-950 container max-w-7xl mx-auto py-10 px-4">
        <ProductGridSkeleton count={8} />
      </div>
    }>
      <ProductsPageContent />
    </Suspense>
  );
}
