import { prisma } from '@config/database';

export const settingsRepository = {
  listAll() {
    return prisma.platformSetting.findMany();
  },

  findByKey(key: string) {
    return prisma.platformSetting.findUnique({ where: { key } });
  },

  upsert(key: string, value: string) {
    return prisma.platformSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  },

  // --- Tax rules ---

  listTaxRules() {
    return prisma.taxRule.findMany({ where: { deletedAt: null } });
  },

  findTaxRule(country: string, region?: string) {
    return prisma.taxRule.findFirst({
      where: { country: country.toUpperCase(), region: region ?? null, deletedAt: null },
    });
  },

  findCountryDefaultTaxRule(country: string) {
    return prisma.taxRule.findFirst({
      where: { country: country.toUpperCase(), region: null, deletedAt: null },
    });
  },

  createTaxRule(data: { country: string; region?: string; rate: number }) {
    return prisma.taxRule.create({
      data: { ...data, country: data.country.toUpperCase() },
    });
  },

  deleteTaxRule(id: string) {
    return prisma.taxRule.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  },
};
