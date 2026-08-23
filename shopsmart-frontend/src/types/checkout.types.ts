export interface GuestAddress {
  fullName: string;
  phone: string;
  line1: string;
  city: string;
  region: string;
  postalCode?: string;
  country: string; // ISO 3166-1 alpha-2, e.g. "US"
}

export interface CreateSessionPayload {
  addressId?: string;
  guestAddress?: GuestAddress;
  shippingMethod: 'standard' | 'express';
}

export interface ConfirmSessionPayload {
  paymentMethod: 'card' | 'cod' | 'bank_transfer';
}

export interface CheckoutSession {
  sessionId: string;
  subtotal: number;
  taxAmount: number;
  shippingAmount: number;
  discountAmount: number;
  totalAmount: number;
  shippingMethod: string;
  expiresAt: string;
}

// ─── Order types ────────────────────────────────────────────────────────────

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'disputed'
  | 'refunded';

export type PaymentStatus = 'pending' | 'succeeded' | 'failed' | 'refunded';
export type PaymentMethod = 'card' | 'cod' | 'bank_transfer';

export interface OrderItem {
  id: string;
  productVariantId: string;
  quantity: number;
  priceAtPurchase: string | number;
  customConfig?: any;
  productVariant?: any;
}

export interface ShippingAddress {
  fullName: string;
  phone: string;
  line1: string;
  city: string;
  region: string;
  postalCode?: string;
  country: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId?: string | null;
  status: OrderStatus;
  subtotal: string | number;
  taxAmount: string | number;
  shippingAmount: string | number;
  discountAmount: string | number;
  totalAmount: string | number;
  shippingAddress: ShippingAddress;
  items: OrderItem[];
  payments?: Payment[];
  createdAt: string;
  statusHistory?: { status: OrderStatus; changedAt: string }[];
  shipment?: {
    trackingNumber?: string;
    carrier?: string;
    estimatedDelivery?: string;
  } | null;
}

export interface Payment {
  id: string;
  orderId: string;
  method: PaymentMethod;
  status: PaymentStatus;
  amount: string | number;
  gatewayPaymentIntentId?: string | null;
  clientSecret?: string | null; // Stripe: provided for card payments to initialize Elements
  createdAt: string;
}

export interface ConfirmCheckoutResult {
  order: Order;
  payment: Payment;
}

export interface OrdersListResponse {
  data: Order[];
  pagination?: {
    nextCursor?: string | null;
    hasMore?: boolean;
  };
}
