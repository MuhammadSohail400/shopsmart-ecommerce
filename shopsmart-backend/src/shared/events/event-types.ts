/**
 * Domain event type definitions (Backend Standards Section 14.2).
 * Modules raise these events rather than calling Notifications
 * synchronously — decoupling the triggering module from whatever reacts
 * to it. Today these are consumed in-process (event-bus.ts); the exact
 * same event shapes are the future message-broker payloads (SDD Section 20).
 */
export interface UserRegisteredEvent {
  userId: string;
  email?: string;
  phone?: string;
}

export interface PasswordResetRequestedEvent {
  userId: string;
  email?: string;
  phone?: string;
  resetToken: string;
}

export interface OrderConfirmedEvent {
  orderId: string;
  userId?: string;
}

export interface OrderStatusChangedEvent {
  orderId: string;
  userId?: string;
  previousStatus: string;
  newStatus: string;
}

export interface LowStockEvent {
  productVariantId: string;
  quantity: number;
  threshold: number;
}

export type DomainEventMap = {
  'user.registered': UserRegisteredEvent;
  'user.password_reset_requested': PasswordResetRequestedEvent;
  'order.confirmed': OrderConfirmedEvent;
  'order.status_changed': OrderStatusChangedEvent;
  'inventory.low_stock': LowStockEvent;
};

export type DomainEventName = keyof DomainEventMap;
