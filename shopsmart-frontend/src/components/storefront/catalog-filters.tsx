"use client";

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useState } from 'react';
import { useCategories, useBrands } from '@/hooks/use-catalog';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Filter, X, Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const SIZES = ['S', 'M', 'L', 'XL', 'XXL'];

export function CatalogFilters() {
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
  };

  const hasActiveFilters = Array.from(searchParams.keys()).some(k => 
    ['category', 'brand', 'size', 'minPrice', 'maxPrice', 'q'].includes(k)
  );

  return (
    <div className="space-y-5 bg-card p-4 sm:p-5 rounded-2xl border border-border/50 shadow-2xs">
      <div className="flex items-center justify-between">
        <h3 className="font-extrabold text-sm sm:text-base flex items-center gap-2 text-foreground">
          <Filter className="w-4 h-4 text-primary" />
          Filters
        </h3>
        {hasActiveFilters && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleClearAll} 
            className="h-7 px-2 text-xs font-bold text-destructive hover:bg-destructive/10 rounded-lg"
          >
            Clear all
          </Button>
        )}
      </div>

      <Separator />

      {/* Categories */}
      <div className="space-y-3">
        <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground">Category</h4>
        {isCategoriesLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        ) : (
          <RadioGroup 
            value={currentCategory} 
            onValueChange={(val) => handleFilterChange('category', val)}
            className="flex flex-col space-y-1 text-xs"
          >
            <div className="flex items-center space-x-2 py-1">
              <RadioGroupItem value="all" id="cat-all" className="h-3.5 w-3.5" />
              <Label htmlFor="cat-all" className="text-xs font-semibold cursor-pointer flex-1">
                All Categories
              </Label>
            </div>
            {categories?.map((cat) => (
              <div key={cat.id} className="flex items-center space-x-2 py-1">
                <RadioGroupItem value={cat.slug} id={`cat-${cat.slug}`} className="h-3.5 w-3.5" />
                <Label htmlFor={`cat-${cat.slug}`} className="text-xs font-medium cursor-pointer flex-1 text-foreground/90">
                  {cat.name}
                </Label>
              </div>
            ))}
          </RadioGroup>
        )}
      </div>

      <Separator />

      {/* Sizes */}
      <div className="space-y-2.5">
        <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground">Size</h4>
        <div className="flex flex-wrap gap-1.5">
          {SIZES.map((sz) => {
            const isSelected = currentSize === sz;
            return (
              <button
                key={sz}
                type="button"
                onClick={() => handleSizeToggle(sz)}
                className={`h-8 w-10 rounded-lg text-xs font-bold border transition-all ${
                  isSelected
                    ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                    : 'bg-background text-foreground border-border/80 hover:border-primary/40'
                }`}
              >
                {sz}
              </button>
            );
          })}
        </div>
      </div>

      <Separator />

      {/* Brands */}
      <div className="space-y-3">
        <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground">Brand</h4>
        {isBrandsLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ) : (
          <RadioGroup 
            value={currentBrand} 
            onValueChange={(val) => handleFilterChange('brand', val)}
            className="flex flex-col space-y-1 text-xs"
          >
            <div className="flex items-center space-x-2 py-1">
              <RadioGroupItem value="all" id="brand-all" className="h-3.5 w-3.5" />
              <Label htmlFor="brand-all" className="text-xs font-semibold cursor-pointer flex-1">
                All Brands
              </Label>
            </div>
            {brands?.map((brand) => (
              <div key={brand.id} className="flex items-center space-x-2 py-1">
                <RadioGroupItem value={brand.slug} id={`brand-${brand.slug}`} className="h-3.5 w-3.5" />
                <Label htmlFor={`brand-${brand.slug}`} className="text-xs font-medium cursor-pointer flex-1 text-foreground/90">
                  {brand.name}
                </Label>
              </div>
            ))}
          </RadioGroup>
        )}
      </div>

      <Separator />

      {/* Price Range (PKR) */}
      <div className="space-y-3">
        <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground">Price Range (Rs.)</h4>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <span className="absolute left-2.5 top-2 text-[10px] font-bold text-muted-foreground">Rs.</span>
            <Input
              type="number"
              placeholder="1000"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="h-8 pl-8 text-xs rounded-lg"
            />
          </div>
          <span className="text-xs text-muted-foreground font-bold">-</span>
          <div className="relative flex-1">
            <span className="absolute left-2.5 top-2 text-[10px] font-bold text-muted-foreground">Rs.</span>
            <Input
              type="number"
              placeholder="10000"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="h-8 pl-8 text-xs rounded-lg"
            />
          </div>
        </div>
        <Button 
          variant="secondary" 
          size="sm" 
          onClick={handlePriceApply} 
          className="w-full h-8 text-xs font-bold rounded-lg shadow-2xs"
        >
          Apply Price
        </Button>
      </div>
    </div>
  );
}
