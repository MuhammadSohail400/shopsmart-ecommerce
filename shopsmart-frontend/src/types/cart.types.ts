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
  attributes: Record<string, string>;
  unitPrice: number;
  quantity: number;
  subtotal: number;
  inStock: boolean;
  productSlug?: string;
  imageUrl?: string | null;
  customConfig?: CustomConfig | null;
}

export interface CartView {
  cartId: string; // DB cart id for registered users, guest-cart-id for guests
  isGuest: boolean;
  items: CartLineItem[];
  subtotal: number;
  appliedCoupon: { code: string; discountAmount: number } | null;
}
