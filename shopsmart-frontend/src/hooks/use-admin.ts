"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminCatalogService, CreateProductInput, UpdateProductInput, CreateVariantInput, UpdateVariantInput, AddImageInput, CreateCategoryInput, UpdateCategoryInput, CreateBrandInput, UpdateBrandInput } from '@/services/admin-catalog.service';
import { adminInventoryService, UpdateInventoryInput } from '@/services/admin-inventory.service';
import { adminOperationsService } from '@/services/admin-operations.service';
import { catalogKeys } from '@/hooks/use-catalog';
import { toast } from 'sonner';

export const adminKeys = {
  all: ['admin'] as const,
  dashboard: () => [...adminKeys.all, 'dashboard'] as const,
  lowStock: () => [...adminKeys.all, 'inventory', 'low-stock'] as const,
  orders: (params?: any) => [...adminKeys.all, 'orders', params] as const,
  shippingZones: () => [...adminKeys.all, 'shipping', 'zones'] as const,
  coupons: () => [...adminKeys.all, 'coupons'] as const,
  banners: () => [...adminKeys.all, 'cms', 'banners'] as const,
  faqs: () => [...adminKeys.all, 'cms', 'faqs'] as const,
  settings: () => [...adminKeys.all, 'settings'] as const,
  taxRules: () => [...adminKeys.all, 'settings', 'tax-rules'] as const,
  staff: () => [...adminKeys.all, 'staff'] as const,
  auditLogs: (params?: any) => [...adminKeys.all, 'audit-logs', params] as const,
  salesAnalytics: (range?: any) => [...adminKeys.all, 'analytics', 'sales', range] as const,
  topProductsAnalytics: (limit?: number) => [...adminKeys.all, 'analytics', 'top-products', limit] as const,
  customerAnalytics: (range?: any) => [...adminKeys.all, 'analytics', 'customers', range] as const,
  abandonedCarts: (params?: any) => [...adminKeys.all, 'analytics', 'abandoned-carts', params] as const,
};

// --- Dashboard ---
export function useAdminDashboardSummary() {
  return useQuery({
    queryKey: adminKeys.dashboard(),
    queryFn: () => adminOperationsService.getDashboardSummary(),
  });
}

// --- Product Mutations ---
export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateProductInput) => adminCatalogService.createProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: catalogKeys.all });
      queryClient.invalidateQueries({ queryKey: adminKeys.all });
      toast.success('Product created successfully');
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to create product');
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProductInput }) => adminCatalogService.updateProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: catalogKeys.all });
      queryClient.invalidateQueries({ queryKey: adminKeys.all });
      toast.success('Product updated successfully');
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to update product');
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminCatalogService.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: catalogKeys.all });
      queryClient.invalidateQueries({ queryKey: adminKeys.all });
      toast.success('Product deleted successfully');
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to delete product');
    },
  });
}

// --- Variant & Image Mutations ---
export function useAddVariant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, data }: { productId: string; data: CreateVariantInput }) => adminCatalogService.addVariant(productId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: catalogKeys.all });
      toast.success('Variant added successfully');
    },
    onError: (err: any) => toast.error(err?.message || 'Failed to add variant'),
  });
}

export function useDeleteVariant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, variantId }: { productId: string; variantId: string }) => adminCatalogService.deleteVariant(productId, variantId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: catalogKeys.all });
      toast.success('Variant deleted successfully');
    },
    onError: (err: any) => toast.error(err?.message || 'Failed to delete variant'),
  });
}

export function useAddImage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, data }: { productId: string; data: AddImageInput }) => adminCatalogService.addImage(productId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: catalogKeys.all });
      toast.success('Image added');
    },
    onError: (err: any) => toast.error(err?.message || 'Failed to add image'),
  });
}

export function useDeleteImage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, imageId }: { productId: string; imageId: string }) => adminCatalogService.deleteImage(productId, imageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: catalogKeys.all });
      toast.success('Image removed');
    },
    onError: (err: any) => toast.error(err?.message || 'Failed to delete image'),
  });
}

// --- Category & Brand Mutations ---
export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCategoryInput) => adminCatalogService.createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: catalogKeys.categories() });
      toast.success('Category created');
    },
    onError: (err: any) => toast.error(err?.message || 'Failed to create category'),
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminCatalogService.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: catalogKeys.categories() });
      toast.success('Category deleted');
    },
    onError: (err: any) => toast.error(err?.message || 'Failed to delete category'),
  });
}

export function useCreateBrand() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateBrandInput) => adminCatalogService.createBrand(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: catalogKeys.brands() });
      toast.success('Brand created');
    },
    onError: (err: any) => toast.error(err?.message || 'Failed to create brand'),
  });
}

export function useDeleteBrand() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminCatalogService.deleteBrand(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: catalogKeys.brands() });
      toast.success('Brand deleted');
    },
    onError: (err: any) => toast.error(err?.message || 'Failed to delete brand'),
  });
}

// --- Inventory ---
export function useLowStockInventory() {
  return useQuery({
    queryKey: adminKeys.lowStock(),
    queryFn: () => adminInventoryService.getLowStock(),
  });
}

export function useUpdateInventory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ variantId, data }: { variantId: string; data: UpdateInventoryInput }) =>
      adminInventoryService.updateInventory(variantId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.lowStock() });
      queryClient.invalidateQueries({ queryKey: catalogKeys.all });
      toast.success('Inventory stock updated');
    },
    onError: (err: any) => {
      if (err?.status === 409) {
        toast.error('Concurrency conflict: Inventory was updated elsewhere. Please refresh.');
      } else {
        toast.error(err?.message || 'Failed to update inventory');
      }
    },
  });
}

// --- Orders ---
export function useAdminOrders(params?: { page?: number; limit?: number; status?: string; search?: string }) {
  return useQuery({
    queryKey: adminKeys.orders(params),
    queryFn: () => adminOperationsService.getOrders(params),
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, status, notes }: { orderId: string; status: string; notes?: string }) =>
      adminOperationsService.updateOrderStatus(orderId, status, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.orders() });
      queryClient.invalidateQueries({ queryKey: adminKeys.dashboard() });
      toast.success('Order status updated');
    },
    onError: (err: any) => toast.error(err?.message || 'Failed to update order status'),
  });
}

// --- Shipping ---
export function useShippingZones() {
  return useQuery({
    queryKey: adminKeys.shippingZones(),
    queryFn: () => adminOperationsService.getShippingZones(),
  });
}

export function useCreateShippingZone() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; countries: string[]; regions?: string[] }) =>
      adminOperationsService.createShippingZone(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.shippingZones() });
      toast.success('Shipping zone created');
    },
    onError: (err: any) => toast.error(err?.message || 'Failed to create shipping zone'),
  });
}

export function useCreateShippingRate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => adminOperationsService.createShippingRate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.shippingZones() });
      toast.success('Shipping rate added');
    },
    onError: (err: any) => toast.error(err?.message || 'Failed to add rate'),
  });
}

// --- Coupons ---
export function useCoupons() {
  return useQuery({
    queryKey: adminKeys.coupons(),
    queryFn: () => adminOperationsService.getCoupons(),
  });
}

export function useCreateCoupon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => adminOperationsService.createCoupon(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.coupons() });
      toast.success('Coupon code created');
    },
    onError: (err: any) => toast.error(err?.message || 'Failed to create coupon'),
  });
}

export function useDeactivateCoupon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminOperationsService.deactivateCoupon(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.coupons() });
      toast.success('Coupon deactivated');
    },
    onError: (err: any) => toast.error(err?.message || 'Failed to deactivate coupon'),
  });
}

// --- CMS Banners & FAQs ---
export function useAdminBanners() {
  return useQuery({
    queryKey: adminKeys.banners(),
    queryFn: () => adminOperationsService.getBanners(),
  });
}

export function useCreateBanner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => adminOperationsService.createBanner(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.banners() });
      queryClient.invalidateQueries({ queryKey: catalogKeys.banners() });
      toast.success('Banner created');
    },
    onError: (err: any) => toast.error(err?.message || 'Failed to create banner'),
  });
}

export function useDeleteBanner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminOperationsService.deleteBanner(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.banners() });
      queryClient.invalidateQueries({ queryKey: catalogKeys.banners() });
      toast.success('Banner deleted');
    },
    onError: (err: any) => toast.error(err?.message || 'Failed to delete banner'),
  });
}

// --- Settings & Tax Rules ---
export function useAdminSettings() {
  return useQuery({
    queryKey: adminKeys.settings(),
    queryFn: () => adminOperationsService.getSettings(),
  });
}

export function useUpdateSetting() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ key, value }: { key: string; value: string }) => adminOperationsService.updateSetting(key, value),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.settings() });
      toast.success('Setting saved');
    },
    onError: (err: any) => toast.error(err?.message || 'Failed to save setting'),
  });
}

export function useTaxRules() {
  return useQuery({
    queryKey: adminKeys.taxRules(),
    queryFn: () => adminOperationsService.getTaxRules(),
  });
}

export function useCreateTaxRule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => adminOperationsService.createTaxRule(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.taxRules() });
      toast.success('Tax rule created');
    },
    onError: (err: any) => toast.error(err?.message || 'Failed to create tax rule'),
  });
}

// --- Phase 11: Staff Management ---
export function useStaff() {
  return useQuery({
    queryKey: adminKeys.staff(),
    queryFn: () => adminOperationsService.getStaff(),
  });
}

export function useCreateStaff() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { email: string; password: string; role: 'admin' | 'inventory_manager' | 'support_agent' }) =>
      adminOperationsService.createStaff(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.staff() });
      toast.success('Staff member onboarded successfully');
    },
    onError: (err: any) => toast.error(err?.message || 'Failed to create staff member'),
  });
}

export function useUpdateStaffRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ staffId, role }: { staffId: string; role: string }) =>
      adminOperationsService.updateStaffRole(staffId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.staff() });
      toast.success('Staff role updated');
    },
    onError: (err: any) => {
      if (err?.code === 'LAST_ADMIN_PROTECTED' || err?.message?.includes('last remaining admin')) {
        toast.error('Last Admin Protection: You cannot demote the only remaining Administrator!');
      } else {
        toast.error(err?.message || 'Failed to update staff role');
      }
    },
  });
}

// --- Phase 11: Audit Logs ---
export function useAuditLogs(params?: { page?: number; limit?: number; actorId?: string; action?: string; entityType?: string }) {
  return useQuery({
    queryKey: adminKeys.auditLogs(params),
    queryFn: () => adminOperationsService.getAuditLogs(params),
  });
}

// --- Phase 11: Analytics & Reports ---
export function useSalesAnalytics(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: adminKeys.salesAnalytics({ startDate, endDate }),
    queryFn: () => adminOperationsService.getSalesAnalytics(startDate, endDate),
  });
}

export function useTopProductsAnalytics(limit = 10) {
  return useQuery({
    queryKey: adminKeys.topProductsAnalytics(limit),
    queryFn: () => adminOperationsService.getTopProductsAnalytics(limit),
  });
}

export function useCustomerAnalytics(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: adminKeys.customerAnalytics({ startDate, endDate }),
    queryFn: () => adminOperationsService.getCustomerAnalytics(startDate, endDate),
  });
}

export function useAbandonedCarts(params?: { cursor?: string; limit?: number }) {
  return useQuery({
    queryKey: adminKeys.abandonedCarts(params),
    queryFn: () => adminOperationsService.getAbandonedCarts(params),
  });
}

