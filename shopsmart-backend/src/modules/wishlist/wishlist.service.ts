import { wishlistRepository } from './wishlist.repository';
import { getProductById } from '@modules/products';
import { addItemForUser } from '@modules/cart';
import { NotFoundError } from '@shared/errors';

export const wishlistService = {
  async getWishlist(userId: string) {
    return wishlistRepository.findOrCreateForUser(userId);
  },

  async addItem(userId: string, productId: string) {
    await getProductById(productId); // throws NotFoundError if it doesn't exist/isn't approved
    const wishlist = await wishlistRepository.findOrCreateForUser(userId);
    await wishlistRepository.addItem(wishlist.id, productId);
    return wishlistRepository.findOrCreateForUser(userId);
  },

  async removeItem(userId: string, productId: string) {
    const wishlist = await wishlistRepository.findOrCreateForUser(userId);
    const existing = await wishlistRepository.findItem(wishlist.id, productId);
    if (!existing) throw new NotFoundError('Wishlist item');
    await wishlistRepository.removeItem(wishlist.id, productId);
  },

  // FR-041: move a wishlist item to cart. Requires a variant, so the caller
  // (controller) must supply which variant the customer wants to add.
  async moveToCart(userId: string, productId: string, productVariantId: string, quantity = 1) {
    await addItemForUser(userId, productVariantId, quantity);
    await this.removeItem(userId, productId);
  },
};
