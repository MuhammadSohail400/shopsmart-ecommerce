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
import { Filter } from 'lucide-react';

export function CatalogFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const { data: categories, isLoading: isCategoriesLoading } = useCategories();
  const { data: brands, isLoading: isBrandsLoading } = useBrands();

  const currentCategory = searchParams.get('category') || 'all';
  const currentBrand = searchParams.get('brand') || 'all';
  
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
    params.delete('minPrice');
    params.delete('maxPrice');
    params.delete('q');
    setMinPrice('');
    setMaxPrice('');
    router.push(pathname + '?' + params.toString());
  };

  const hasActiveFilters = Array.from(searchParams.keys()).some(k => ['category', 'brand', 'minPrice', 'maxPrice', 'q'].includes(k));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <Filter className="w-5 h-5" />
          Filters
        </h3>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={handleClearAll} className="h-8 text-muted-foreground">
            Clear all
          </Button>
        )}
      </div>

      <Separator />

      {/* Categories */}
      <div className="space-y-4">
        <h4 className="font-medium text-sm">Category</h4>
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
            className="flex flex-col space-y-1.5"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="all" id="cat-all" />
              <Label htmlFor="cat-all" className="font-normal cursor-pointer text-muted-foreground">All Categories</Label>
            </div>
            {categories?.map((cat) => (
              <div key={cat.id} className="flex items-center space-x-2">
                <RadioGroupItem value={cat.slug} id={`cat-${cat.id}`} />
                <Label htmlFor={`cat-${cat.id}`} className="font-normal cursor-pointer">{cat.name}</Label>
              </div>
            ))}
          </RadioGroup>
        )}
      </div>

      <Separator />

      {/* Brands */}
      <div className="space-y-4">
        <h4 className="font-medium text-sm">Brand</h4>
        {isBrandsLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ) : (
          <RadioGroup 
            value={currentBrand} 
            onValueChange={(val) => handleFilterChange('brand', val)}
            className="flex flex-col space-y-1.5"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="all" id="brand-all" />
              <Label htmlFor="brand-all" className="font-normal cursor-pointer text-muted-foreground">All Brands</Label>
            </div>
            {brands?.map((brand) => (
              <div key={brand.id} className="flex items-center space-x-2">
                <RadioGroupItem value={brand.slug} id={`brand-${brand.id}`} />
                <Label htmlFor={`brand-${brand.id}`} className="font-normal cursor-pointer">{brand.name}</Label>
              </div>
            ))}
          </RadioGroup>
        )}
      </div>

      <Separator />

      {/* Price Range */}
      <div className="space-y-4">
        <h4 className="font-medium text-sm">Price Range</h4>
        <div className="flex items-center gap-2">
          <Input 
            type="number" 
            placeholder="Min" 
            value={minPrice} 
            onChange={(e) => setMinPrice(e.target.value)}
            className="h-9"
          />
          <span className="text-muted-foreground">-</span>
          <Input 
            type="number" 
            placeholder="Max" 
            value={maxPrice} 
            onChange={(e) => setMaxPrice(e.target.value)}
            className="h-9"
          />
        </div>
        <Button variant="secondary" size="sm" className="w-full" onClick={handlePriceApply}>
          Apply Range
        </Button>
      </div>
    </div>
  );
}
