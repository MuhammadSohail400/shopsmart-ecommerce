export interface CartLineItem {
  productVariantId: string;
  title: string;
  attributes: Record<string, string>;
  unitPrice: number;
  quantity: number;
  subtotal: number;
  inStock: boolean;
  productSlug?: string;
  imageUrl?: string | null;
}

export interface CartView {
  cartId: string; // DB cart id for registered users, guest-cart-id for guests
  isGuest: boolean;
  items: CartLineItem[];
  subtotal: number;
  appliedCoupon: { code: string; discountAmount: number } | null;
}
