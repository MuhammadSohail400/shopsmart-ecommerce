import { v4 as uuidv4 } from 'uuid';
import { redis } from '@config/redis';
import { GUEST_CART_TTL_SECONDS } from '@shared/constants/limits';
import type { GuestCartData } from './cart.types';

/**
 * Guest carts are Redis-only (SDD Section 6/11) — never written to
 * PostgreSQL. Keyed by an opaque cart ID the client stores and sends
 * back via the X-Guest-Cart-Id header (API Design Specification Section 5).
 */
const key = (guestCartId: string) => `cart:guest:${guestCartId}`;

export const guestCartStore = {
  generateId(): string {
    return uuidv4();
  },

  async get(guestCartId: string): Promise<GuestCartData> {
    const raw = await redis.get(key(guestCartId));
    return raw ? (JSON.parse(raw) as GuestCartData) : { items: [] };
  },

  async save(guestCartId: string, data: GuestCartData): Promise<void> {
    await redis.set(key(guestCartId), JSON.stringify(data), 'EX', GUEST_CART_TTL_SECONDS);
  },

  async clear(guestCartId: string): Promise<void> {
    await redis.del(key(guestCartId));
  },
};
