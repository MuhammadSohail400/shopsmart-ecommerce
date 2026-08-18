import { apiClient } from '@/lib/api-client';

export interface DashboardSummary {
  kpis: {
    totalRevenue: number;
    totalOrders: number;
    totalProducts: number;
    lowStockCount: number;
    totalCustomers: number;
  };
  recentOrders: Array<{
    id: string;
    total: number;
    status: string;
    createdAt: string;
    user?: {
      email: string;
      profile?: { firstName: string; lastName: string };
    };
  }>;
}

export interface AdminOrder {
  id: string;
  userId: string;
  status: string;
  total: number;
  subtotal: number;
  tax: number;
  shippingFee: number;
  discount: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    email: string;
    role: string;
    profile?: {
      firstName: string;
      lastName: string;
      phone?: string;
    };
  };
  items: Array<{
    id: string;
    productId: string;
    productVariantId: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    product?: {
      title: string;
      slug: string;
      images?: Array<{ url: string }>;
    };
    variant?: {
      sku: string;
      attributes: Record<string, string>;
    };
  }>;
  shippingAddress?: {
    fullName: string;
    phone: string;
    line1: string;
    city: string;
    region: string;
    country: string;
  };
}

export interface ShippingZone {
  id: string;
  name: string;
  countries: string[];
  regions?: string[];
  rates?: ShippingRate[];
}

export interface ShippingRate {
  id: string;
  zoneId: string;
  name: string;
  minWeight?: number;
  maxWeight?: number;
  minPrice?: number;
  maxPrice?: number;
  rate: number;
  estimatedDaysMin?: number;
  estimatedDaysMax?: number;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'flat';
  discountValue: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  usageLimit?: number;
  usedCount: number;
  isActive: boolean;
  expiresAt?: string;
  createdAt: string;
}

export interface BannerItem {
  id: string;
  title: string;
  imageUrl: string;
  linkUrl?: string;
  sortOrder: number;
  isActive: boolean;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category?: string;
  sortOrder: number;
}

export interface StoreSetting {
  id: string;
  key: string;
  value: string;
  group?: string;
}

export interface TaxRule {
  id: string;
  country: string;
  region?: string;
  rate: number;
  name: string;
}

export const adminOperationsService = {
  // Dashboard
  async getDashboardSummary(): Promise<DashboardSummary> {
    return apiClient<DashboardSummary>('/admin/dashboard/summary');
  },

  // Orders
  async getOrders(params: { page?: number; limit?: number; status?: string; search?: string } = {}): Promise<{ data: AdminOrder[]; total: number }> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') searchParams.append(k, String(v));
    });
    return apiClient(`/admin/orders?${searchParams.toString()}`);
  },

  async updateOrderStatus(orderId: string, status: string, notes?: string): Promise<any> {
    return apiClient(`/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, notes }),
    });
  },

  async issueRefund(orderId: string, data: { amount: number; reason?: string }): Promise<any> {
    return apiClient(`/orders/${orderId}/refunds`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Shipping
  async getShippingZones(): Promise<ShippingZone[]> {
    return apiClient<ShippingZone[]>('/shipping/zones');
  },

  async createShippingZone(data: { name: string; countries: string[]; regions?: string[] }): Promise<ShippingZone> {
    return apiClient<ShippingZone>('/shipping/zones', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async createShippingRate(data: {
    zoneId: string;
    name: string;
    rate: number;
    minPrice?: number;
    maxPrice?: number;
    estimatedDaysMin?: number;
    estimatedDaysMax?: number;
  }): Promise<ShippingRate> {
    return apiClient<ShippingRate>('/shipping/rates', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Coupons
  async getCoupons(): Promise<Coupon[]> {
    return apiClient<Coupon[]>('/coupons');
  },

  async createCoupon(data: {
    code: string;
    discountType: 'percentage' | 'flat';
    discountValue: number;
    minOrderAmount?: number;
    maxDiscountAmount?: number;
    usageLimit?: number;
    expiresAt?: string;
  }): Promise<Coupon> {
    return apiClient<Coupon>('/coupons', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateCoupon(id: string, data: Partial<Coupon>): Promise<Coupon> {
    return apiClient<Coupon>(`/coupons/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  async deactivateCoupon(id: string): Promise<void> {
    return apiClient<void>(`/coupons/${id}`, {
      method: 'DELETE',
    });
  },

  // CMS Banners & FAQ
  async getBanners(): Promise<BannerItem[]> {
    return apiClient<BannerItem[]>('/cms/banners');
  },

  async createBanner(data: { title: string; imageUrl: string; linkUrl?: string; sortOrder?: number }): Promise<BannerItem> {
    return apiClient<BannerItem>('/cms/banners', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateBanner(id: string, data: Partial<BannerItem>): Promise<BannerItem> {
    return apiClient<BannerItem>(`/cms/banners/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  async deleteBanner(id: string): Promise<void> {
    return apiClient<void>(`/cms/banners/${id}`, {
      method: 'DELETE',
    });
  },

  async getFaqs(): Promise<FaqItem[]> {
    return apiClient<FaqItem[]>('/cms/faq');
  },

  async createFaq(data: { question: string; answer: string; category?: string; sortOrder?: number }): Promise<FaqItem> {
    return apiClient<FaqItem>('/cms/faq', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async deleteFaq(id: string): Promise<void> {
    return apiClient<void>(`/cms/faq/${id}`, {
      method: 'DELETE',
    });
  },

  // Settings & Tax Rules
  async getSettings(): Promise<StoreSetting[]> {
    return apiClient<StoreSetting[]>('/admin/settings');
  },

  async updateSetting(key: string, value: string): Promise<any> {
    return apiClient('/admin/settings', {
      method: 'PATCH',
      body: JSON.stringify({ key, value }),
    });
  },

  async getTaxRules(): Promise<TaxRule[]> {
    return apiClient<TaxRule[]>('/admin/settings/tax-rules');
  },

  async createTaxRule(data: { country: string; region?: string; rate: number; name: string }): Promise<TaxRule> {
    return apiClient<TaxRule>('/admin/settings/tax-rules', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};
