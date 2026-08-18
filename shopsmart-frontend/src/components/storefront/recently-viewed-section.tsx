"use client";

import { useRecentlyViewed } from '@/features/products/hooks/use-recently-viewed';
import { ProductCard } from './product-card';
import { ProductGrid } from './product-grid';
import { Eye, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RecentlyViewedSectionProps {
  currentProductId?: string;
  title?: string;
  subtitle?: string;
}

export function RecentlyViewedSection({
  currentProductId,
  title = 'Recently Viewed',
  subtitle = 'Pick up right where you left off.',
}: RecentlyViewedSectionProps) {
  const { recentlyViewed, removeProduct, clearAll } = useRecentlyViewed();

  // Filter out the current product if on detail page
  const items = currentProductId
    ? recentlyViewed.filter((p) => p.id !== currentProductId)
    : recentlyViewed;

  if (items.length === 0) return null;

  return (
    <section className="container py-16 border-t border-border/50">
      <div className="flex items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
            <Eye className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              {title}
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>
          </div>
        </div>

        {/* Clear All Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={clearAll}
          className="text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full font-bold gap-1.5 transition-colors"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Clear All
        </Button>
      </div>

      <ProductGrid>
        {items.slice(0, 4).map((product) => (
          <div key={product.id} className="relative group/card">
            {/* Individual Remove Button */}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                removeProduct(product.id);
              }}
              title="Remove from recently viewed"
              className="absolute top-2 right-2 z-20 h-7 w-7 rounded-full bg-background/90 hover:bg-destructive text-foreground hover:text-white shadow-md border border-border flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-all duration-200"
            >
              <X className="h-3.5 w-3.5" />
            </button>
            <ProductCard product={product} />
          </div>
        ))}
      </ProductGrid>
    </section>
  );
}
