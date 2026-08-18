"use client";

import Link from 'next/link';
import { ShoppingBag, ArrowRight, Grid, Sparkles, ChevronRight } from 'lucide-react';
import { useCategories } from '@/hooks/use-catalog';
import { Skeleton } from '@/components/ui/skeleton';
import { Breadcrumbs } from '@/components/shared/breadcrumbs';
import { Badge } from '@/components/ui/badge';

export default function CategoriesPage() {
  const { data: categories, isLoading } = useCategories();

  const parentCategories = categories?.filter(c => c.depth === 0) || categories || [];
  const getChildren = (parentId: string) => categories?.filter(c => c.parentId === parentId) || [];

  return (
    <div className="container max-w-7xl mx-auto py-6 sm:py-10 px-4 sm:px-6">
      <Breadcrumbs items={[{ label: 'Categories' }]} className="mb-4 sm:mb-6" />
      
      <div className="flex flex-col gap-2 mb-8 sm:mb-10">
        <div className="inline-flex items-center gap-1.5 text-primary text-xs font-bold uppercase tracking-wider">
          <Grid className="h-3.5 w-3.5" /> Department Directory
        </div>
        <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-foreground">
          Explore All Categories
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-xl">
          Browse our entire fashion collection across Men, Women, Kids, Shirts, and Accessories.
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-44 rounded-2xl" />
          ))}
        </div>
      ) : parentCategories.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {parentCategories.map((category) => {
            const subcategories = getChildren(category.id);
            return (
              <div 
                key={category.id} 
                className="group flex flex-col border border-border/50 rounded-2xl overflow-hidden bg-card shadow-2xs hover:shadow-md hover:border-primary/40 transition-all duration-300"
              >
                <Link 
                  href={`/products?category=${category.slug}`}
                  className="p-5 bg-secondary/30 group-hover:bg-primary/5 transition-colors flex items-center justify-between border-b border-border/40"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="h-11 w-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 shadow-2xs shrink-0">
                      <ShoppingBag className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-base font-bold text-foreground group-hover:text-primary transition-colors truncate">
                        {category.name}
                      </h2>
                      {subcategories.length > 0 && (
                        <p className="text-[11px] text-muted-foreground font-medium">
                          {subcategories.length} subcategories
                        </p>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0" />
                </Link>
                
                {subcategories.length > 0 && (
                  <div className="p-4 flex flex-wrap gap-1.5">
                    {subcategories.map((child) => (
                      <Link 
                        key={child.id}
                        href={`/products?category=${child.slug}`} 
                        className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-secondary/50 hover:bg-primary/10 hover:text-primary transition-colors text-muted-foreground hover:border-primary/20"
                      >
                        {child.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center text-sm text-muted-foreground bg-card rounded-2xl border border-border/50">
          No categories found in the catalog.
        </div>
      )}
    </div>
  );
}
