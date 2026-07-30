export interface OrderItemInput {
  productVariantId: string;
  quantity: number;
  priceAtPurchase: number;
}

export interface ShippingAddressSnapshot {
  fullName: string;
  phone: string;
  line1: string;
  city: string;
  region: string;
  postalCode?: string;
  country: string;
}

export interface CreateOrderInput {
  userId?: string;
  addressId?: string; // optional link back to a saved Address (registered users only)
  shippingAddress: ShippingAddressSnapshot;
  items: OrderItemInput[];
  subtotal: number;
  taxAmount: number;
  shippingAmount: number;
  discountAmount: number;
  totalAmount: number;
}
