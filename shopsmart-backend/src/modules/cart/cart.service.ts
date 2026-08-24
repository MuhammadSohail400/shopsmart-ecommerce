import type { Prisma } from '@prisma/client';
import { cartRepository } from './cart.repository';
import { guestCartStore } from './cart.guest-store';
import { NotFoundError, ConflictError } from '@shared/errors';
import { checkAvailability } from '@modules/inventory';
import { validateCoupon } from '@modules/coupons';
import { getVariantById } from '@modules/products';
import type { CartView, CartLineItem, CustomConfig } from './cart.types';

interface CartContext {
  userId?: string;
  guestCartId?: string;
}

function calculateCustomPrice(basePrice: number, priceModifier: number, customConfig?: any): { unitPrice: number; validatedConfig: CustomConfig | null } {
  if (!customConfig) {
    return {
      unitPrice: basePrice + priceModifier,
      validatedConfig: null,
    };
  }

  const printPosition = customConfig.printPosition || 'front';
  const customizationPrice = printPosition === 'front_back' ? 400 : 0;
  const unitPrice = basePrice + priceModifier + customizationPrice;

  const validatedConfig: CustomConfig = {
    shirtType: customConfig.shirtType || 'oversized',
    color: customConfig.color || 'Black',
    size: customConfig.size || 'L',
    printPosition,
    designUrl: customConfig.designUrl || '',
    previewUrl: customConfig.previewUrl || customConfig.designUrl || '',
    basePrice: basePrice + priceModifier,
    customizationPrice,
    finalPrice: unitPrice,
  };

  return { unitPrice, validatedConfig };
}

/**
 * Resolves line-item details (title, price, stock) for a guest cart's raw
 * {productVariantId, quantity, customConfig} list.
 */
async function buildGuestCartView(guestCartId: string): Promise<CartView> {
  const data = await guestCartStore.get(guestCartId);
  const lineItems: CartLineItem[] = [];

  for (const item of data.items) {
    const variant = await getVariantById(item.productVariantId);
    if (!variant) continue;

    const basePrice = Number(variant.product.basePrice);
    const priceModifier = Number(variant.priceModifier);
    const { unitPrice, validatedConfig } = calculateCustomPrice(basePrice, priceModifier, item.customConfig);

    const available = variant.inventory
      ? variant.inventory.quantity - variant.inventory.reservedQuantity
      : 0;

    const resolvedImage = item.customConfig?.previewUrl || item.customConfig?.designUrl || variant.product.images?.[0]?.url || null;

    lineItems.push({
      id: item.id,
      productVariantId: item.productVariantId,
      title: variant.product.title,
      productSlug: variant.product.slug,
      imageUrl: resolvedImage,
      attributes: variant.attributes as Record<string, string>,
      unitPrice,
      quantity: item.quantity,
      subtotal: Math.round(unitPrice * item.quantity * 100) / 100,
      inStock: available >= item.quantity,
      customConfig: validatedConfig,
    });
  }

  const subtotal = lineItems.reduce((sum, i) => sum + i.subtotal, 0);
  let appliedCoupon: CartView['appliedCoupon'] = null;
  if (data.couponCode) {
    try {
      const { coupon, discountAmount } = await validateCoupon(data.couponCode, subtotal);
      appliedCoupon = { code: coupon!.code, discountAmount };
    } catch {
      appliedCoupon = null;
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
      const basePrice = Number(item.productVariant.product.basePrice);
      const priceModifier = Number(item.productVariant.priceModifier);
      const { unitPrice, validatedConfig } = calculateCustomPrice(basePrice, priceModifier, item.customConfig);

      const available = item.productVariant.inventory
        ? item.productVariant.inventory.quantity - item.productVariant.inventory.reservedQuantity
        : 0;

      const customImg = (item.customConfig as any)?.previewUrl || (item.customConfig as any)?.designUrl;
      const resolvedImage = customImg || item.productVariant.product.images?.[0]?.url || null;

      return {
        id: item.id,
        productVariantId: item.productVariantId,
        title: item.productVariant.product.title,
        productSlug: item.productVariant.product.slug,
        imageUrl: resolvedImage,
        attributes: item.productVariant.attributes as Record<string, string>,
        unitPrice,
        quantity: item.quantity,
        subtotal: Math.round(unitPrice * item.quantity * 100) / 100,
        inStock: available >= item.quantity,
        customConfig: validatedConfig,
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

  async addItem(ctx: CartContext, productVariantId: string, quantity: number, customConfig?: any): Promise<CartView> {
    const available = await checkAvailability(productVariantId, quantity);
    if (!available) throw new ConflictError('OUT_OF_STOCK', 'This item does not have enough stock available');

    const variant = await getVariantById(productVariantId);
    if (!variant) throw new NotFoundError('Product variant');

    const basePrice = Number(variant.product.basePrice);
    const priceModifier = Number(variant.priceModifier);
    const { validatedConfig } = calculateCustomPrice(basePrice, priceModifier, customConfig);

    if (ctx.userId) {
      const cart = await cartRepository.findOrCreateForUser(ctx.userId);
      await cartRepository.upsertItem(cart.id, productVariantId, quantity, validatedConfig);
      return buildRegisteredCartView(ctx.userId);
    }

    const guestCartId = ctx.guestCartId || guestCartStore.generateId();
    const data = await guestCartStore.get(guestCartId);
    data.items.push({ 
      id: `guest-item-${Date.now()}`,
      productVariantId, 
      quantity,
      customConfig: validatedConfig || undefined,
    });
    await guestCartStore.save(guestCartId, data);
    return buildGuestCartView(guestCartId);
  },

  async updateItemQuantity(ctx: CartContext, itemIdentifier: string, quantity: number): Promise<CartView> {
    if (ctx.userId) {
      const cart = await cartRepository.findOrCreateForUser(ctx.userId);
      await cartRepository.updateItemQuantity(cart.id, itemIdentifier, quantity);
      return buildRegisteredCartView(ctx.userId);
    }

    const guestCartId = ctx.guestCartId!;
    const data = await guestCartStore.get(guestCartId);
    const item = data.items.find((i) => i.id === itemIdentifier || i.productVariantId === itemIdentifier);
    if (!item) throw new NotFoundError('Cart item');
    item.quantity = quantity;
    await guestCartStore.save(guestCartId, data);
    return buildGuestCartView(guestCartId);
  },

  async removeItem(ctx: CartContext, itemIdentifier: string): Promise<CartView> {
    if (ctx.userId) {
      const cart = await cartRepository.findOrCreateForUser(ctx.userId);
      await cartRepository.removeItem(cart.id, itemIdentifier);
      return buildRegisteredCartView(ctx.userId);
    }

    const guestCartId = ctx.guestCartId!;
    const data = await guestCartStore.get(guestCartId);
    data.items = data.items.filter((i) => i.id !== itemIdentifier && i.productVariantId !== itemIdentifier);
    await guestCartStore.save(guestCartId, data);
    return buildGuestCartView(guestCartId);
  },

  async clearCart(ctx: CartContext): Promise<void> {
    if (ctx.userId) {
      const cart = await cartRepository.findOrCreateForUser(ctx.userId);
      await cartRepository.clearItems(cart.id);
      return;
    }
    if (ctx.guestCartId) {
      await guestCartStore.clear(ctx.guestCartId);
    }
  },

  async clear(ctx: CartContext): Promise<void> {
    return this.clearCart(ctx);
  },

  async mergeGuestCart(userId: string, guestCartId: string): Promise<CartView> {
    const guestData = await guestCartStore.get(guestCartId);
    if (guestData.items.length > 0) {
      const cart = await cartRepository.findOrCreateForUser(userId);
      for (const item of guestData.items) {
        await cartRepository.upsertItem(cart.id, item.productVariantId, item.quantity, item.customConfig);
      }
      await guestCartStore.clear(guestCartId);
    }
    return buildRegisteredCartView(userId);
  },

  async applyCoupon(ctx: CartContext, code: string): Promise<CartView> {
    const cart = await this.getCart(ctx);
    const { coupon, discountAmount } = await validateCoupon(code, cart.subtotal);

    if (ctx.guestCartId) {
      const data = await guestCartStore.get(ctx.guestCartId);
      data.couponCode = coupon!.code;
      await guestCartStore.save(ctx.guestCartId, data);
      return buildGuestCartView(ctx.guestCartId);
    }

    return {
      ...cart,
      appliedCoupon: { code: coupon!.code, discountAmount },
    };
  },

  async removeCoupon(ctx: CartContext): Promise<CartView> {
    if (ctx.guestCartId) {
      const data = await guestCartStore.get(ctx.guestCartId);
      delete data.couponCode;
      await guestCartStore.save(ctx.guestCartId, data);
      return buildGuestCartView(ctx.guestCartId);
    }
    const cart = await this.getCart(ctx);
    return { ...cart, appliedCoupon: null };
  },
};
