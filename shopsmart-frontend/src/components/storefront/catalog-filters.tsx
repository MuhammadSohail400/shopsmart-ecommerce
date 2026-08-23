"use client";

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useState, useEffect } from 'react';
import { useCategories, useBrands } from '@/hooks/use-catalog';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Filter, X, Check, Sparkles, SlidersHorizontal, RotateCcw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const SIZES = ['S', 'M', 'L', 'XL', 'XXL'];

interface CatalogFiltersProps {
  onFilterApplied?: () => void;
}

export function CatalogFilters({ onFilterApplied }: CatalogFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const { data: categories, isLoading: isCategoriesLoading } = useCategories();
  const { data: brands, isLoading: isBrandsLoading } = useBrands();

  const currentCategory = searchParams.get('category') || 'all';
  const currentBrand = searchParams.get('brand') || 'all';
  const currentSize = searchParams.get('size') || '';
  
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');

  useEffect(() => {
    setMinPrice(searchParams.get('minPrice') || '');
    setMaxPrice(searchParams.get('maxPrice') || '');
  }, [searchParams]);

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === 'all' || value === '') {
        params.delete(name);
      } else {
        params.set(name, value);
      }
      return params.toString();
    },
    [searchParams]
  );

  const handleFilterChange = (name: string, value: string) => {
    router.push(pathname + '?' + createQueryString(name, value));
    if (onFilterApplied) onFilterApplied();
  };

  const handleSizeToggle = (size: string) => {
    const nextSize = currentSize === size ? '' : size;
    handleFilterChange('size', nextSize);
  };

  const handlePriceApply = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (minPrice) params.set('minPrice', minPrice);
    else params.delete('minPrice');
    
    if (maxPrice) params.set('maxPrice', maxPrice);
    else params.delete('maxPrice');
    
    router.push(pathname + '?' + params.toString());
    if (onFilterApplied) onFilterApplied();
  };

  const handlePricePreset = (min: string, max: string) => {
    setMinPrice(min);
    setMaxPrice(max);
    const params = new URLSearchParams(searchParams.toString());
    if (min) params.set('minPrice', min);
    else params.delete('minPrice');
    if (max) params.set('maxPrice', max);
    else params.delete('maxPrice');
    router.push(pathname + '?' + params.toString());
    if (onFilterApplied) onFilterApplied();
  };

  const handleClearAll = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('category');
    params.delete('brand');
    params.delete('size');
    params.delete('minPrice');
    params.delete('maxPrice');
    params.delete('q');
    setMinPrice('');
    setMaxPrice('');
    router.push(pathname + '?' + params.toString());
    if (onFilterApplied) onFilterApplied();
  };

  const hasActiveFilters = Array.from(searchParams.keys()).some(k => 
    ['category', 'brand', 'size', 'minPrice', 'maxPrice', 'q'].includes(k)
  );

  // Filter out redundant placeholder categories
  const displayCategories = categories?.filter(c => 
    !['men', 'women', 'kids', 'collections', 'qa-test-category', 'qa-cat-1787069265619'].includes(c.slug)
  ) || [];

  return (
    <div className="space-y-6 bg-zinc-900/70 p-5 rounded-md border border-zinc-800 text-zinc-100">
      
      {/* Filter Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-mono font-bold text-xs uppercase tracking-widest flex items-center gap-2 text-zinc-200">
          <SlidersHorizontal className="w-3.5 h-3.5 text-rose-500" />
          <span>FILTERS</span>
        </h3>
        {hasActiveFilters && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleClearAll} 
            className="h-7 px-2 text-[11px] font-mono font-bold text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 rounded flex items-center gap-1"
          >
            <RotateCcw className="h-3 w-3" />
            <span>RESET</span>
          </Button>
        )}
      </div>

      <Separator className="bg-zinc-800" />

      {/* Categories Section */}
      <div className="space-y-3">
        <h4 className="font-mono font-bold text-[11px] uppercase tracking-wider text-zinc-400">
          COLLECTION / CATEGORY
        </h4>
        {isCategoriesLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full bg-zinc-800/60" />
            <Skeleton className="h-4 w-3/4 bg-zinc-800/60" />
            <Skeleton className="h-4 w-5/6 bg-zinc-800/60" />
          </div>
        ) : (
          <RadioGroup 
            value={currentCategory} 
            onValueChange={(val) => handleFilterChange('category', val)}
            className="flex flex-col space-y-1 text-xs"
          >
            <div className="flex items-center space-x-2 py-1 hover:bg-zinc-850/50 px-1.5 rounded transition-colors">
              <RadioGroupItem value="all" id="cat-all" className="h-3.5 w-3.5 border-zinc-700 text-rose-600 focus:ring-rose-500" />
              <Label htmlFor="cat-all" className="text-xs font-mono font-medium cursor-pointer flex-1 text-zinc-300 hover:text-white">
                ALL COLLECTIONS
              </Label>
            </div>
            {displayCategories.map((cat) => (
              <div key={cat.id} className="flex items-center space-x-2 py-1 hover:bg-zinc-850/50 px-1.5 rounded transition-colors">
                <RadioGroupItem value={cat.slug} id={`cat-${cat.slug}`} className="h-3.5 w-3.5 border-zinc-700 text-rose-600 focus:ring-rose-500" />
                <Label htmlFor={`cat-${cat.slug}`} className="text-xs font-mono font-medium cursor-pointer flex-1 text-zinc-300 hover:text-white">
                  {cat.name.toUpperCase()}
                </Label>
              </div>
            ))}
          </RadioGroup>
        )}
      </div>

      <Separator className="bg-zinc-800" />

      {/* Sizing Section */}
      <div className="space-y-3">
        <h4 className="font-mono font-bold text-[11px] uppercase tracking-wider text-zinc-400">
          SIZE (STREETWEAR FIT)
        </h4>
        <div className="flex flex-wrap gap-1.5">
          {SIZES.map((sz) => {
            const isSelected = currentSize === sz;
            return (
              <button
                key={sz}
                type="button"
                onClick={() => handleSizeToggle(sz)}
                className={`h-8 w-11 rounded text-xs font-mono font-bold border transition-all ${
                  isSelected
                    ? 'bg-rose-600 text-white border-rose-500 shadow-md'
                    : 'bg-zinc-950 text-zinc-300 border-zinc-800 hover:border-zinc-700 hover:text-white'
                }`}
              >
                {sz}
              </button>
            );
          })}
        </div>
      </div>

      <Separator className="bg-zinc-800" />

      {/* Price Range (PKR) */}
      <div className="space-y-3">
        <h4 className="font-mono font-bold text-[11px] uppercase tracking-wider text-zinc-400">
          PRICE RANGE (PKR)
        </h4>
        
        {/* Quick presets */}
        <div className="grid grid-cols-3 gap-1.5 text-[10px] font-mono">
          <button
            type="button"
            onClick={() => handlePricePreset('', '2500')}
            className="py-1 px-1.5 rounded bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700 transition-colors"
          >
            &lt; 2,500
          </button>
          <button
            type="button"
            onClick={() => handlePricePreset('2500', '4000')}
            className="py-1 px-1.5 rounded bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700 transition-colors"
          >
            2.5k - 4k
          </button>
          <button
            type="button"
            onClick={() => handlePricePreset('4000', '')}
            className="py-1 px-1.5 rounded bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700 transition-colors"
          >
            &gt; 4,000
          </button>
        </div>

        {/* Inputs */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <span className="absolute left-2.5 top-2 text-[10px] font-mono text-zinc-500">PKR</span>
            <Input
              type="number"
              placeholder="MIN"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="h-8 pl-9 text-xs font-mono bg-zinc-950 border-zinc-800 text-zinc-100 rounded placeholder:text-zinc-600 focus-visible:ring-rose-500"
            />
          </div>
          <span className="text-xs text-zinc-600 font-mono font-bold">-</span>
          <div className="relative flex-1">
            <span className="absolute left-2.5 top-2 text-[10px] font-mono text-zinc-500">PKR</span>
            <Input
              type="number"
              placeholder="MAX"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="h-8 pl-9 text-xs font-mono bg-zinc-950 border-zinc-800 text-zinc-100 rounded placeholder:text-zinc-600 focus-visible:ring-rose-500"
            />
          </div>
        </div>

        <Button 
          type="button"
          variant="secondary" 
          size="sm" 
          onClick={handlePriceApply} 
          className="w-full h-8 text-xs font-mono font-bold uppercase tracking-wider bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded"
        >
          APPLY PRICE
        </Button>
      </div>

    </div>
  );
}
