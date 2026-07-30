import { shippingRepository } from './shipping.repository';
import { NotFoundError, BusinessRuleError } from '@shared/errors';
import type { CreateZoneBody, CreateRateBody } from './shipping.validators';

export const shippingService = {
  async listZones() {
    return shippingRepository.listZones();
  },

  async createZone(data: CreateZoneBody) {
    return shippingRepository.createZone(data);
  },

  async createRate(data: CreateRateBody) {
    const zone = await shippingRepository.findZoneById(data.zoneId);
    if (!zone) throw new NotFoundError('Shipping zone');
    return shippingRepository.createRate(data);
  },

  /**
   * BR-011: shipping is restricted to explicitly enabled regions/zones.
   * Throws if the destination country isn't covered by any zone.
   */
  async calculate(country: string, method: string): Promise<{ zoneId: string; cost: number; etaDays: number }> {
    const zone = await shippingRepository.findZoneByCountry(country);
    if (!zone) {
      throw new BusinessRuleError(
        'SHIPPING_ZONE_UNSUPPORTED',
        'We currently do not ship to this destination',
      );
    }

    const rate = await shippingRepository.findRate(zone.id, method);
    if (!rate) {
      throw new BusinessRuleError(
        'SHIPPING_METHOD_UNAVAILABLE',
        `The ${method} shipping method is not available for this destination`,
      );
    }

    return { zoneId: zone.id, cost: Number(rate.cost), etaDays: rate.etaDays };
  },

  async createShipmentForOrder(orderId: string) {
    return shippingRepository.createShipment(orderId);
  },

  async getShipmentByOrderId(orderId: string) {
    return shippingRepository.findShipmentByOrderId(orderId);
  },

  async updateShipment(orderId: string, data: { trackingNumber?: string; courier?: string; status?: string }) {
    const existing = await shippingRepository.findShipmentByOrderId(orderId);
    if (!existing) throw new NotFoundError('Shipment');
    return shippingRepository.updateShipment(orderId, data);
  },
};
