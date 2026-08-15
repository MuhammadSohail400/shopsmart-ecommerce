import { ReactNode } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface ProductGridProps {
  children: ReactNode;
}

export function ProductGrid({ children }: ProductGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {children}
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <ProductGrid>
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="flex flex-col overflow-hidden border-muted">
          <div className="aspect-square w-full bg-muted/50 flex items-center justify-center">
            <Skeleton className="h-full w-full rounded-none" />
          </div>
          <CardContent className="flex flex-col gap-2 p-4 pt-5 flex-1">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-5 w-1/2" />
          </CardContent>
          <CardFooter className="p-4 pt-0 flex justify-between items-end">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-10 w-10 rounded-full" />
          </CardFooter>
        </Card>
      ))}
    </ProductGrid>
  );
}
