import { categoriesRepository } from './categories.repository';
import { NotFoundError, BusinessRuleError, ConflictError } from '@shared/errors';
import type { CreateCategoryBody } from './categories.validators';

const MAX_CATEGORY_DEPTH = 2; // 3 levels total: 0, 1, 2 (FR-026)

export const categoriesService = {
  async list() {
    return categoriesRepository.findAll();
  },

  async getById(id: string) {
    const category = await categoriesRepository.findById(id);
    if (!category) throw new NotFoundError('Category');
    return category;
  },

  async create(data: CreateCategoryBody) {
    const existing = await categoriesRepository.findBySlug(data.slug);
    if (existing) throw new ConflictError('SLUG_ALREADY_EXISTS', 'A category with this slug already exists');

    if (data.parentId) {
      const parent = await categoriesRepository.findById(data.parentId);
      if (!parent) throw new NotFoundError('Parent category');
      if (parent.depth >= MAX_CATEGORY_DEPTH) {
        throw new BusinessRuleError(
          'MAX_CATEGORY_DEPTH_EXCEEDED',
          'Categories can only be nested up to 3 levels deep',
        );
      }
    }

    return categoriesRepository.create(data);
  },

  async update(id: string, data: Partial<CreateCategoryBody>) {
    const existing = await categoriesRepository.findById(id);
    if (!existing) throw new NotFoundError('Category');
    return categoriesRepository.update(id, data);
  },

  async remove(id: string) {
    const existing = await categoriesRepository.findById(id);
    if (!existing) throw new NotFoundError('Category');

    // ON DELETE RESTRICT semantics enforced at the application layer too
    // (DDD Section 6): cannot delete a category with active products.
    const productCount = await categoriesRepository.countProducts(id);
    if (productCount > 0) {
      throw new ConflictError(
        'CATEGORY_HAS_PRODUCTS',
        'Cannot delete a category that still has products assigned. Reassign them first.',
      );
    }

    await categoriesRepository.softDelete(id);
  },
};
