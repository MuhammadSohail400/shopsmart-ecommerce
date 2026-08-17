import type { Prisma } from '@prisma/client';
import { cartRepository } from './cart.repository';
import { guestCartStore } from './cart.guest-store';
import { NotFoundError, ConflictError } from '@shared/errors';
import { checkAvailability } from '@modules/inventory';
import { validateCoupon } from '@modules/coupons';
import { getVariantById } from '@modules/products';
import type { CartView, CartLineItem } from './cart.types';

interface CartContext {
  userId?: string;
  guestCartId?: string;
}

/**
 * Resolves line-item details (title, price, stock) for a guest cart's raw
 * {productVariantId, quantity} list by calling the Products module's
 * public interface — cart never queries Product tables directly
 * (Backend Standards Section 4).
 */
async function buildGuestCartView(guestCartId: string): Promise<CartView> {
  const data = await guestCartStore.get(guestCartId);
  const lineItems: CartLineItem[] = [];

  for (const item of data.items) {
    const variant = await getVariantById(item.productVariantId);
    if (!variant) continue; // silently drop items whose product/variant was removed since adding

    const unitPrice = Number(variant.product.basePrice) + Number(variant.priceModifier);
    const available = variant.inventory
      ? variant.inventory.quantity - variant.inventory.reservedQuantity
      : 0;

    lineItems.push({
      productVariantId: item.productVariantId,
      title: variant.product.title,
      productSlug: variant.product.slug,
      imageUrl: variant.product.images?.[0]?.url ?? null,
      attributes: variant.attributes as Record<string, string>,
      unitPrice,
      quantity: item.quantity,
      subtotal: Math.round(unitPrice * item.quantity * 100) / 100,
      inStock: available >= item.quantity,
    });
  }

  const subtotal = lineItems.reduce((sum, i) => sum + i.subtotal, 0);
  let appliedCoupon: CartView['appliedCoupon'] = null;
  if (data.couponCode) {
    try {
      const { coupon, discountAmount } = await validateCoupon(data.couponCode, subtotal);
      appliedCoupon = { code: coupon!.code, discountAmount };
    } catch {
      appliedCoupon = null; // coupon no longer valid; silently drop rather than error on a read
    }
  }

  return { cartId: guestCartId, isGuest: true, items: lineItems, subtotal, appliedCoupon };
}

type RegisteredCartItem = Prisma.CartItemGetPayload<{
  include: { productVariant: { include: { product: { include: { images: true } }; inventory: true } } };
}>;

async function buildRegisteredCartView(userId: string): Promise<CartView> {
  const cart = await cartRepository.findOrCreateForUser(userId);

  const lineItems: CartLineItem[] = cart.items.map(
    (item: RegisteredCartItem) => {
      const unitPrice = Number(item.productVariant.product.basePrice) + Number(item.productVariant.priceModifier);
      const available = item.productVariant.inventory
        ? item.productVariant.inventory.quantity - item.productVariant.inventory.reservedQuantity
        : 0;
      return {
        productVariantId: item.productVariantId,
        title: item.productVariant.product.title,
        productSlug: item.productVariant.product.slug,
        imageUrl: item.productVariant.product.images?.[0]?.url ?? null,
        attributes: item.productVariant.attributes as Record<string, string>,
        unitPrice,
        quantity: item.quantity,
        subtotal: Math.round(unitPrice * item.quantity * 100) / 100,
        inStock: available >= item.quantity,
      };
    },
  );

  const subtotal = lineItems.reduce((sum, i) => sum + i.subtotal, 0);
  return { cartId: cart.id, isGuest: false, items: lineItems, subtotal, appliedCoupon: null };
}

export const cartService = {
  async getCart(ctx: CartContext): Promise<CartView> {
    if (ctx.userId) return buildRegisteredCartView(ctx.userId);
    if (ctx.guestCartId) return buildGuestCartView(ctx.guestCartId);
    throw new NotFoundError('Cart');
  },

  async addItem(ctx: CartContext, productVariantId: string, quantity: number): Promise<CartView> {
    const available = await checkAvailability(productVariantId, quantity);
    if (!available) throw new ConflictError('OUT_OF_STOCK', 'This item does not have enough stock available');

    if (ctx.userId) {
      const cart = await cartRepository.findOrCreateForUser(ctx.userId);
      const existing = await cartRepository.findItem(cart.id, productVariantId);
      const newQuantity = (existing?.quantity ?? 0) + quantity;
      await cartRepository.upsertItem(cart.id, productVariantId, newQuantity);
      return buildRegisteredCartView(ctx.userId);
    }

    const guestCartId = ctx.guestCartId ?? guestCartStore.generateId();
    const data = await guestCartStore.get(guestCartId);
    const existing = data.items.find((i) => i.productVariantId === productVariantId);
    if (existing) existing.quantity += quantity;
    else data.items.push({ productVariantId, quantity });
    await guestCartStore.save(guestCartId, data);
    return buildGuestCartView(guestCartId);
  },

  async updateItemQuantity(ctx: CartContext, productVariantId: string, quantity: number): Promise<CartView> {
    const available = await checkAvailability(productVariantId, quantity);
    if (!available) throw new ConflictError('OUT_OF_STOCK', 'This item does not have enough stock available');

    if (ctx.userId) {
      const cart = await cartRepository.findOrCreateForUser(ctx.userId);
      await cartRepository.upsertItem(cart.id, productVariantId, quantity);
      return buildRegisteredCartView(ctx.userId);
    }

    const guestCartId = ctx.guestCartId!;
    const data = await guestCartStore.get(guestCartId);
    const item = data.items.find((i) => i.productVariantId === productVariantId);
    if (!item) throw new NotFoundError('Cart item');
    item.quantity = quantity;
    await guestCartStore.save(guestCartId, data);
    return buildGuestCartView(guestCartId);
  },

  async removeItem(ctx: CartContext, productVariantId: string): Promise<CartView> {
    if (ctx.userId) {
      const cart = await cartRepository.findOrCreateForUser(ctx.userId);
      await cartRepository.removeItem(cart.id, productVariantId).catch(() => undefined);
      return buildRegisteredCartView(ctx.userId);
    }

    const guestCartId = ctx.guestCartId!;
    const data = await guestCartStore.get(guestCartId);
    data.items = data.items.filter((i) => i.productVariantId !== productVariantId);
    await guestCartStore.save(guestCartId, data);
    return buildGuestCartView(guestCartId);
  },

  async applyCoupon(ctx: CartContext, code: string): Promise<CartView> {
    const view = await this.getCart(ctx);
    await validateCoupon(code, view.subtotal, ctx.userId); // throws if invalid (BR-003)

    if (ctx.guestCartId && !ctx.userId) {
      const data = await guestCartStore.get(ctx.guestCartId);
      data.couponCode = code;
      await guestCartStore.save(ctx.guestCartId, data);
      return buildGuestCartView(ctx.guestCartId);
    }
    // Registered-user coupon application is finalized at Checkout (Phase 5),
    // where it's tied to the CheckoutSession rather than the Cart itself.
    return this.getCart(ctx);
  },

  async removeCoupon(ctx: CartContext): Promise<CartView> {
    if (ctx.guestCartId && !ctx.userId) {
      const data = await guestCartStore.get(ctx.guestCartId);
      delete data.couponCode;
      await guestCartStore.save(ctx.guestCartId, data);
      return buildGuestCartView(ctx.guestCartId);
    }
    return this.getCart(ctx);
  },

  async mergeGuestCart(userId: string, guestCartId: string): Promise<CartView> {
    const guestData = await guestCartStore.get(guestCartId);
    if (guestData && guestData.items.length > 0) {
      const userCart = await cartRepository.findOrCreateForUser(userId);
      for (const item of guestData.items) {
        const existing = await cartRepository.findItem(userCart.id, item.productVariantId);
        const newQuantity = (existing?.quantity ?? 0) + item.quantity;
        await cartRepository.upsertItem(userCart.id, item.productVariantId, newQuantity);
      }
      await guestCartStore.clear(guestCartId).catch(() => undefined);
    }
    return buildRegisteredCartView(userId);
  },

  async clear(ctx: CartContext): Promise<void> {
    if (ctx.userId) {
      const cart = await cartRepository.findOrCreateForUser(ctx.userId);
      await cartRepository.clearItems(cart.id);
      return;
    }
    if (ctx.guestCartId) await guestCartStore.clear(ctx.guestCartId);
  },
};
