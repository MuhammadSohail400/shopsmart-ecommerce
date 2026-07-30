import { prisma } from '@config/database';
import { PaymentMethod, PaymentStatus, RefundStatus } from '@prisma/client';

export const paymentsRepository = {
  findByIdempotencyKey(idempotencyKey: string) {
    return prisma.payment.findUnique({ where: { idempotencyKey } });
  },

  findByGatewayIntentId(gatewayPaymentIntentId: string) {
    return prisma.payment.findUnique({ where: { gatewayPaymentIntentId } });
  },

  findByOrderId(orderId: string) {
    return prisma.payment.findMany({ where: { orderId }, orderBy: { createdAt: 'desc' } });
  },

  create(data: {
    orderId: string;
    gatewayPaymentIntentId?: string;
    amount: number;
    method: PaymentMethod;
    idempotencyKey: string;
    status?: PaymentStatus;
  }) {
    return prisma.payment.create({ data });
  },

  updateStatus(id: string, status: PaymentStatus) {
    return prisma.payment.update({ where: { id }, data: { status } });
  },

  createRefund(data: { paymentId: string; gatewayRefundId?: string; amount: number; reason?: string }) {
    return prisma.refund.create({ data });
  },

  updateRefundStatus(id: string, status: RefundStatus) {
    return prisma.refund.update({ where: { id }, data: { status } });
  },
};
