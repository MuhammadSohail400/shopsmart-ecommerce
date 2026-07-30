import { brandsRepository } from './brands.repository';
import { NotFoundError, ConflictError } from '@shared/errors';
import type { CreateBrandBody } from './brands.validators';

export const brandsService = {
  async list() {
    return brandsRepository.findAll();
  },

  async getById(id: string) {
    const brand = await brandsRepository.findById(id);
    if (!brand) throw new NotFoundError('Brand');
    return brand;
  },

  async create(data: CreateBrandBody) {
    const existing = await brandsRepository.findBySlug(data.slug);
    if (existing) throw new ConflictError('SLUG_ALREADY_EXISTS', 'A brand with this slug already exists');
    return brandsRepository.create(data);
  },

  async update(id: string, data: Partial<CreateBrandBody>) {
    const existing = await brandsRepository.findById(id);
    if (!existing) throw new NotFoundError('Brand');
    return brandsRepository.update(id, data);
  },

  async remove(id: string) {
    const existing = await brandsRepository.findById(id);
    if (!existing) throw new NotFoundError('Brand');
    // Brand -> Product is ON DELETE SET NULL (DDD Section 6), so removal is
    // safe without a blocking product-count check (unlike Category).
    await brandsRepository.softDelete(id);
  },
};
