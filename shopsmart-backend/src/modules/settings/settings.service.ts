import { settingsRepository } from './settings.repository';
import { ConflictError } from '@shared/errors';
import type { CreateTaxRuleBody } from './settings.validators';

// Fallback defaults used when no PlatformSetting row exists yet — keeps the
// app functional out of the box without requiring seed data (Backend
// Standards Section 11.5: settings read through one utility, sane fallbacks).
const DEFAULTS: Record<string, string> = {
  MAX_ORDER_QUANTITY_PER_SKU: '10', // BR-008
  MIN_ORDER_VALUE: '0', // BR-009
};

export const settingsService = {
  async list() {
    return settingsRepository.listAll();
  },

  async get(key: string): Promise<string> {
    const setting = await settingsRepository.findByKey(key);
    return setting?.value ?? DEFAULTS[key] ?? '';
  },

  async update(key: string, value: string) {
    return settingsRepository.upsert(key, value);
  },

  async updateBulk(settings: Record<string, string>) {
    const entries = Object.entries(settings);
    const results = [];
    for (const [key, value] of entries) {
      if (key && typeof value === 'string') {
        const saved = await settingsRepository.upsert(key, value);
        results.push(saved);
      }
    }
    return results;
  },

  async getPublicStoreInfo() {
    const all = await settingsRepository.listAll();
    const map: Record<string, string> = {
      store_name: 'ShopSmart',
      currency: 'PKR',
      free_shipping_threshold: '2500',
      support_email: 'support@shopsmart.ai',
      support_phone: '+92 300 1234567',
    };
    all.forEach((s) => {
      map[s.key] = s.value;
    });
    return map;
  },

  async listTaxRules() {
    return settingsRepository.listTaxRules();
  },

  async createTaxRule(data: CreateTaxRuleBody) {
    const existing = await settingsRepository.findTaxRule(data.country, data.region);
    if (existing) throw new ConflictError('TAX_RULE_EXISTS', 'A tax rule for this country/region already exists');
    return settingsRepository.createTaxRule(data);
  },

  async deleteTaxRule(id: string) {
    return settingsRepository.deleteTaxRule(id);
  },

  /**
   * BR-010: tax calculated based on shipping destination's applicable
   * rate. Falls back to the country-wide default rule if no region-specific
   * rule matches; falls back to 0 if no rule exists at all for that country
   * (rather than blocking checkout — a missing tax rule is an admin
   * configuration gap, not a reason to fail every order to that country).
   */
  async getTaxRateForRegion(country: string, region?: string): Promise<number> {
    if (region) {
      const regional = await settingsRepository.findTaxRule(country, region);
      if (regional) return Number(regional.rate);
    }
    const countryDefault = await settingsRepository.findCountryDefaultTaxRule(country);
    return countryDefault ? Number(countryDefault.rate) : 0;
  },
};
