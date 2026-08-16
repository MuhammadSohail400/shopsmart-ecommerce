import { ReactNode } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface ProductGridProps {
  children: ReactNode;
}

export function ProductGrid({ children }: ProductGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
      {children}
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <ProductGrid>
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="flex flex-col overflow-hidden border-border bg-card rounded-lg">
          <div className="aspect-square w-full bg-muted/50 flex items-center justify-center">
            <Skeleton className="h-full w-full rounded-none" />
          </div>
          <CardContent className="flex flex-col gap-1 p-3 flex-1">
            <Skeleton className="h-2 w-12" />
            <Skeleton className="h-4 w-3/4 mt-1" />
            <Skeleton className="h-4 w-1/2" />
          </CardContent>
          <CardFooter className="p-3 pt-0 flex justify-between items-end">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </CardFooter>
        </Card>
      ))}
    </ProductGrid>
  );
}
