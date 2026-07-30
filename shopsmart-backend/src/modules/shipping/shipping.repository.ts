import { prisma } from '@config/database';

export const shippingRepository = {
  listZones() {
    return prisma.shippingZone.findMany({ where: { deletedAt: null }, include: { rates: true } });
  },

  findZoneByCountry(country: string) {
    return prisma.shippingZone.findFirst({
      where: { deletedAt: null, countries: { has: country.toUpperCase() } },
      include: { rates: true },
    });
  },

  findZoneById(id: string) {
    return prisma.shippingZone.findFirst({ where: { id, deletedAt: null } });
  },

  createZone(data: { name: string; countries: string[] }) {
    return prisma.shippingZone.create({ data: { ...data, countries: data.countries.map((c) => c.toUpperCase()) } });
  },

  createRate(data: { zoneId: string; method: string; cost: number; etaDays: number }) {
    return prisma.shippingRate.create({ data });
  },

  findRate(zoneId: string, method: string) {
    return prisma.shippingRate.findUnique({ where: { zoneId_method: { zoneId, method } } });
  },

  // --- Shipment (per-order tracking) ---

  createShipment(orderId: string) {
    return prisma.shipment.create({ data: { orderId } });
  },

  findShipmentByOrderId(orderId: string) {
    return prisma.shipment.findUnique({ where: { orderId } });
  },

  updateShipment(orderId: string, data: { trackingNumber?: string; courier?: string; status?: string }) {
    return prisma.shipment.update({ where: { orderId }, data: data as never });
  },
};
