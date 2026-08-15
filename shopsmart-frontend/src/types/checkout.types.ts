export interface GuestAddress {
  fullName: string;
  phone: string;
  line1: string;
  city: string;
  region: string;
  postalCode?: string;
  country: string;
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

export interface OrderResult {
  id: string;
  userId?: string | null;
  guestCartId?: string | null;
  status: string;
  paymentStatus: string;
  total: string;
  createdAt: string;
}

export interface CheckoutConfirmationResult {
  order: OrderResult;
}
