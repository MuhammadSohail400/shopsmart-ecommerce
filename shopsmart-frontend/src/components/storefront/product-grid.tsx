import { ReactNode } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface ProductGridProps {
  children: ReactNode;
}

export function ProductGrid({ children }: ProductGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5 lg:gap-6">
      {children}
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <ProductGrid>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex flex-col overflow-hidden border border-zinc-850 bg-zinc-900/60 rounded-md">
          <div className="aspect-[4/5] w-full bg-zinc-900/80">
            <Skeleton className="h-full w-full bg-zinc-800/50 rounded-none animate-pulse" />
          </div>
          <div className="flex flex-col gap-2 p-3 sm:p-4 flex-1">
            <Skeleton className="h-3 w-16 bg-zinc-800/60" />
            <Skeleton className="h-4 w-5/6 bg-zinc-800/60 mt-1" />
            <Skeleton className="h-3.5 w-1/3 bg-zinc-800/60" />
          </div>
        </div>
      ))}
    </ProductGrid>
  );
}
