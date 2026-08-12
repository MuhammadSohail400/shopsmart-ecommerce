/**
 * Settings Module — public interface.
 * Responsibility: platform-wide configuration (tax rules, order limits).
 * Dependencies: none.
 */
export { settingsRoutes } from './settings.routes';

export async function getTaxRateForRegion(country: string, region?: string) {
  const { settingsService } = await import('./settings.service');
  return settingsService.getTaxRateForRegion(country, region);
}

export async function getSetting(key: string): Promise<string> {
  const { settingsService } = await import('./settings.service');
  return settingsService.get(key);
}
