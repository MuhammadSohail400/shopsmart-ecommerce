"use client";

import { useRecentlyViewed } from '@/features/products/hooks/use-recently-viewed';
import { ProductCard } from './product-card';
import { ProductGrid } from './product-grid';
import { Eye } from 'lucide-react';

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
  const { recentlyViewed } = useRecentlyViewed();

  // Filter out the current product if on detail page
  const items = currentProductId
    ? recentlyViewed.filter((p) => p.id !== currentProductId)
    : recentlyViewed;

  if (items.length === 0) return null;

  return (
    <section className="container py-16 border-t border-border/50">
      <div className="flex items-center gap-3 mb-8">
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

      <ProductGrid>
        {items.slice(0, 4).map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </ProductGrid>
    </section>
  );
}
