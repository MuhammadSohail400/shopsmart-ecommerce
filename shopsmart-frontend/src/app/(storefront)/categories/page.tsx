"use client";

import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';
import { useCategories } from '@/hooks/use-catalog';
import { Skeleton } from '@/components/ui/skeleton';
import { Breadcrumbs } from '@/components/shared/breadcrumbs';

export default function CategoriesPage() {
  const { data: categories, isLoading } = useCategories();

  // For the categories page, we might want to group them by parentId, but for now we'll just show them all.
  // The backend returns a flat list with depth and parentId.
  const parentCategories = categories?.filter(c => c.depth === 0) || [];
  const getChildren = (parentId: string) => categories?.filter(c => c.parentId === parentId) || [];

  return (
    <div className="container py-8 sm:py-12">
      <Breadcrumbs items={[{ label: 'Categories' }]} className="mb-6" />
      <div className="flex flex-col gap-2 mb-10">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">All Categories</h1>
        <p className="text-sm sm:text-base text-muted-foreground">Browse our entire catalog by category.</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      ) : parentCategories.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {parentCategories.map((category) => (
            <div key={category.id} className="flex flex-col border rounded-xl overflow-hidden bg-card shadow-sm hover:shadow-md transition-shadow">
              <Link 
                href={`/products?category=${category.slug}`}
                className="group p-6 bg-muted/30 hover:bg-muted/50 transition-colors flex items-center gap-4"
              >
                <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                  <ShoppingBag className="h-6 w-6" />
                </div>
                <h2 className="text-xl font-bold">{category.name}</h2>
              </Link>
              
              {getChildren(category.id).length > 0 && (
                <div className="p-6 pt-4 flex flex-col gap-2">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Subcategories</h3>
                  <ul className="space-y-2">
                    {getChildren(category.id).map(child => (
                      <li key={child.id}>
                        <Link href={`/products?category=${child.slug}`} className="text-foreground/80 hover:text-primary transition-colors hover:underline">
                          {child.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground">No categories found.</p>
      )}
    </div>
  );
}
