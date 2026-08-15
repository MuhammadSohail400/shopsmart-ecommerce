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
  id: string;
  cartId: string;
  userId?: string | null;
  guestCartId?: string | null;
  status: string;
  expiresAt: string;
  
  subtotal: string;
  tax: string;
  shippingTotal: string;
  total: string;
  
  shippingMethod: string;
  guestAddress?: GuestAddress | null;
  addressId?: string | null;
  
  createdAt: string;
  updatedAt: string;
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
