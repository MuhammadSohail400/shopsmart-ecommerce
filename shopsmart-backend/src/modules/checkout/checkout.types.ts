export interface CheckoutContext {
  userId?: string;
  guestCartId?: string;
}

export interface CheckoutPreview {
  sessionId: string;
  subtotal: number;
  taxAmount: number;
  shippingAmount: number;
  discountAmount: number;
  totalAmount: number;
  shippingMethod: string;
  expiresAt: string;
}
