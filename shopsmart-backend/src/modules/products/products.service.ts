import { productsRepository } from './products.repository';
import { NotFoundError, ConflictError, BusinessRuleError } from '@shared/errors';
import { ProductStatus } from '@prisma/client';
// Cross-module calls go through each module's public interface only
// (Backend Standards Section 4/6) — never their internal repositories.
import { getCategoryTree } from '@modules/categories';
import { getBrandById } from '@modules/brands';
import { initializeStock, checkAvailability } from '@modules/inventory';
import { recordAuditLog } from '@modules/audit-logs';
import type { CreateProductBody, CreateVariantBody, AddImageBody } from './products.validators';

const MAX_VARIANT_ATTRIBUTES_STRING = (attrs: Record<string, string>) => JSON.stringify(attrs);

export const productsService = {
  async list(filters: {
    q?: string;
    category?: string;
    brand?: string;
    minPrice?: number;
    maxPrice?: number;
    sort?: string;
    cursor?: string;
    limit: number;
  }) {
    const { items, hasMore } = await productsRepository.list(filters);
    return {
      items,
      nextCursor: hasMore ? items[items.length - 1]?.id ?? null : null,
      hasMore,
    };
  },

  async getById(id: string) {
    const product = await productsRepository.findById(id);
    if (!product) throw new NotFoundError('Product');
    return product;
  },

  // Used by staff-facing endpoints where draft/pending products are visible
  async getByIdForStaff(id: string) {
    const product = await productsRepository.findByIdAnyStatus(id);
    if (!product) throw new NotFoundError('Product');
    return product;
  },

  async create(data: CreateProductBody, actorId?: string) {
    const existingSlug = await productsRepository.findBySlug(data.slug);
    if (existingSlug) throw new ConflictError('SLUG_ALREADY_EXISTS', 'A product with this slug already exists');

    // Verify referenced category/brand actually exist, via each owning module
    const tree = await getCategoryTree();
    const categoryExists = flattenTree(tree).some((c) => c.id === data.categoryId);
    if (!categoryExists) throw new NotFoundError('Category');

    if (data.brandId) {
      const brand = await getBrandById(data.brandId);
      if (!brand) throw new NotFoundError('Brand');
    }

    const product = await productsRepository.create(data);
    await recordAuditLog(actorId, 'product.created', 'Product', product.id, undefined, data as unknown as object);
    return product;
  },

  async update(id: string, data: Partial<CreateProductBody> & { status?: ProductStatus }, actorId?: string) {
    const existing = await productsRepository.findByIdAnyStatus(id);
    if (!existing) throw new NotFoundError('Product');
    const updated = await productsRepository.update(id, data);
    await recordAuditLog(actorId, 'product.updated', 'Product', id, existing as unknown as object, data as unknown as object);
    return updated;
  },

  async archive(id: string, actorId?: string) {
    const existing = await productsRepository.findByIdAnyStatus(id);
    if (!existing) throw new NotFoundError('Product');
    await productsRepository.softDelete(id); // FR-020: soft delete, order history unaffected
    await recordAuditLog(actorId, 'product.archived', 'Product', id);
  },

  // --- Variants ---

  async addVariant(productId: string, data: CreateVariantBody) {
    const product = await productsRepository.findByIdAnyStatus(productId);
    if (!product) throw new NotFoundError('Product');

    const existingSku = await productsRepository.findVariantBySku(data.sku);
    if (existingSku) throw new ConflictError('SKU_ALREADY_EXISTS', 'This SKU is already in use');

    // VR-010: unique attribute combination per product
    const attrsKey = MAX_VARIANT_ATTRIBUTES_STRING(data.attributes);
    const duplicateAttrs = product.variants.some(
      (v: { attributes: unknown }) =>
        MAX_VARIANT_ATTRIBUTES_STRING(v.attributes as Record<string, string>) === attrsKey,
    );
    if (duplicateAttrs) {
      throw new BusinessRuleError(
        'DUPLICATE_VARIANT_ATTRIBUTES',
        'A variant with this exact attribute combination already exists for this product',
      );
    }

    const variant = await productsRepository.createVariant(productId, {
      sku: data.sku,
      attributes: data.attributes,
      priceModifier: data.priceModifier,
    });

    // Inventory module is the sole owner of stock — products never writes
    // to the Inventory table directly (Backend Standards Section 4)
    await initializeStock(variant.id, data.initialStock);

    return variant;
  },

  async updateVariant(productId: string, variantId: string, data: Record<string, unknown>) {
    const variant = await productsRepository.findVariant(variantId, productId);
    if (!variant) throw new NotFoundError('Product variant');
    return productsRepository.updateVariant(variantId, data);
  },

  async removeVariant(productId: string, variantId: string) {
    const variant = await productsRepository.findVariant(variantId, productId);
    if (!variant) throw new NotFoundError('Product variant');
    await productsRepository.softDeleteVariant(variantId);
  },

  async isPurchasable(productId: string, variantId: string, quantity: number): Promise<boolean> {
    const product = await productsRepository.findById(productId);
    if (!product || product.status !== ProductStatus.approved) return false;
    return checkAvailability(variantId, quantity);
  },

  // --- Images ---

  async addImage(productId: string, data: AddImageBody) {
    const product = await productsRepository.findByIdAnyStatus(productId);
    if (!product) throw new NotFoundError('Product');
    return productsRepository.addImage(productId, data);
  },

  async removeImage(productId: string, imageId: string) {
    const product = await productsRepository.findByIdAnyStatus(productId);
    if (!product) throw new NotFoundError('Product');
    await productsRepository.removeImage(imageId);
  },

  async reorderImage(productId: string, imageId: string, sortOrder: number) {
    const product = await productsRepository.findByIdAnyStatus(productId);
    if (!product) throw new NotFoundError('Product');
    return productsRepository.reorderImage(imageId, sortOrder);
  },
};

function flattenTree(nodes: unknown[]): Array<{ id: string }> {
  const result: Array<{ id: string }> = [];
  for (const node of nodes as Array<{ id: string; children: unknown[] }>) {
    result.push({ id: node.id });
    result.push(...flattenTree(node.children));
  }
  return result;
}
