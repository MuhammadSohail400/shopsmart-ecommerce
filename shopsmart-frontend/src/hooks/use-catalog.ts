import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { productsService, ProductFilters } from '@/services/products.service';
import { categoriesService } from '@/services/categories.service';
import { brandsService } from '@/services/brands.service';
import { cmsService } from '@/services/cms.service';

export const catalogKeys = {
  all: ['catalog'] as const,
  products: (filters: ProductFilters) => [...catalogKeys.all, 'products', filters] as const,
  productDetail: (slugOrId: string) => [...catalogKeys.all, 'product', slugOrId] as const,
  categories: () => [...catalogKeys.all, 'categories'] as const,
  categoryDetail: (id: string) => [...catalogKeys.all, 'categories', id] as const,
  brands: () => [...catalogKeys.all, 'brands'] as const,
  brandDetail: (id: string) => [...catalogKeys.all, 'brands', id] as const,
  banners: () => [...catalogKeys.all, 'banners'] as const,
};

export function useProducts(filters: ProductFilters) {
  return useInfiniteQuery({
    queryKey: catalogKeys.products(filters),
    queryFn: ({ pageParam = undefined }) =>
      productsService.getProducts({ ...filters, cursor: pageParam as string | undefined }),
    getNextPageParam: (lastPage) => lastPage.pagination.nextCursor,
    initialPageParam: undefined as string | undefined,
  });
}

export function useProduct(slugOrId: string) {
  return useQuery({
    queryKey: catalogKeys.productDetail(slugOrId),
    queryFn: () => productsService.getProduct(slugOrId),
    enabled: !!slugOrId,
  });
}

export function useCategories() {
  return useQuery({
    queryKey: catalogKeys.categories(),
    queryFn: () => categoriesService.getCategories(),
  });
}

export function useBrands() {
  return useQuery({
    queryKey: catalogKeys.brands(),
    queryFn: () => brandsService.getBrands(),
  });
}

export function useBanners() {
  return useQuery({
    queryKey: catalogKeys.banners(),
    queryFn: () => cmsService.getBanners(),
  });
}
