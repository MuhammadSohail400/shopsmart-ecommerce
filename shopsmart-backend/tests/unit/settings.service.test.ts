import { describe, it, expect, vi, beforeEach } from 'vitest';
import { settingsService } from '../../src/modules/settings/settings.service';
import { settingsRepository } from '../../src/modules/settings/settings.repository';

vi.mock('../../src/modules/settings/settings.repository', () => ({
  settingsRepository: {
    listAll: vi.fn(),
    findByKey: vi.fn(),
    upsert: vi.fn(),
    listTaxRules: vi.fn(),
    findTaxRule: vi.fn(),
    createTaxRule: vi.fn(),
    deleteTaxRule: vi.fn(),
  },
}));

describe('Settings Service (ASORA Storefront Configuration & WhatsApp)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns default ASORA public store info including 03110297772 WhatsApp number', async () => {
    vi.mocked(settingsRepository.listAll).mockResolvedValue([]);

    const info = await settingsService.getPublicStoreInfo();

    expect(info.store_name).toBe('ASORA');
    expect(info.currency).toBe('PKR');
    expect(info.support_phone).toBe('03110297772');
    expect(info.whatsapp_number).toBe('03110297772');
    expect(info.free_shipping_threshold).toBe('2500');
  });

  it('overrides defaults when database settings are present', async () => {
    vi.mocked(settingsRepository.listAll).mockResolvedValue([
      { key: 'whatsapp_number', value: '03001234567' } as any,
      { key: 'free_shipping_threshold', value: '3000' } as any,
    ]);

    const info = await settingsService.getPublicStoreInfo();

    expect(info.whatsapp_number).toBe('03001234567');
    expect(info.free_shipping_threshold).toBe('3000');
    expect(info.store_name).toBe('ASORA');
  });

  it('updates bulk settings correctly', async () => {
    vi.mocked(settingsRepository.upsert).mockResolvedValue({ id: '1', key: 'whatsapp_number', value: '03110297772' } as any);

    const result = await settingsService.updateBulk({
      whatsapp_number: '03110297772',
      store_name: 'ASORA',
    });

    expect(settingsRepository.upsert).toHaveBeenCalledWith('whatsapp_number', '03110297772');
    expect(settingsRepository.upsert).toHaveBeenCalledWith('store_name', 'ASORA');
    expect(result).toHaveLength(2);
  });
});
