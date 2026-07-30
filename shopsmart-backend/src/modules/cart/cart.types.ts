export interface CartLineItem {
  productVariantId: string;
  title: string;
  attributes: Record<string, string>;
  unitPrice: number;
  quantity: number;
  subtotal: number;
  inStock: boolean;
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
  items: Array<{ productVariantId: string; quantity: number }>;
  couponCode?: string;
}
