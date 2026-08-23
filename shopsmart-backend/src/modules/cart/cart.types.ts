export interface CustomConfig {
  shirtType: string;
  color: string;
  size: string;
  printPosition: 'front' | 'back' | 'front_back';
  designUrl: string;
  previewUrl?: string;
  basePrice: number;
  customizationPrice: number;
  finalPrice: number;
}

export interface CartLineItem {
  id?: string;
  productVariantId: string;
  title: string;
  productSlug: string;
  imageUrl: string | null;
  attributes: Record<string, string>;
  unitPrice: number;
  quantity: number;
  subtotal: number;
  inStock: boolean;
  customConfig?: CustomConfig | null;
}

export interface CartView {
  cartId: string; // DB cart id for registered users, guest-cart-id for guests
  isGuest: boolean;
  items: CartLineItem[];
  subtotal: number;
  appliedCoupon: { code: string; discountAmount: number } | null;
}

/** Internal storage shape for a guest cart, persisted in Redis (SDD Section 6). */
export interface GuestCartData {
  items: Array<{ 
    id?: string;
    productVariantId: string; 
    quantity: number;
    customConfig?: CustomConfig;
  }>;
  couponCode?: string;
}
