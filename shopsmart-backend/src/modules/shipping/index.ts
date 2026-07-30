/**
 * Shipping Module — public interface.
 * Responsibility: zone/rate configuration, cost calculation, per-order
 * shipment tracking.
 * Dependencies: none.
 */
export { shippingRoutes } from './shipping.routes';

export async function calculateShippingCost(country: string, method: string) {
  const { shippingService } = await import('./shipping.service');
  return shippingService.calculate(country, method);
}

export async function createShipmentForOrder(orderId: string) {
  const { shippingService } = await import('./shipping.service');
  return shippingService.createShipmentForOrder(orderId);
}
