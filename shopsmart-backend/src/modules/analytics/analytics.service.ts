import { analyticsRepository } from './analytics.repository';

export const analyticsService = {
  async getOverview() {
    const { adminRepository } = await import('@modules/admin/admin.repository');
    const [orderCountsByStatus, totalRevenue, lowStockResult] = await Promise.all([
      adminRepository.orderCountsByStatus(),
      adminRepository.totalRevenue(),
      adminRepository.countLowStockItems(),
    ]);
    return {
      orderCountsByStatus,
      totalRevenue,
      lowStockItemCount: Number(lowStockResult[0]?.count ?? 0),
    };
  },

  async getSalesSummary(startDate: Date, endDate: Date) {
    return analyticsRepository.salesSummary(startDate, endDate);
  },

  async getTopProducts(limit: number) {
    return analyticsRepository.topProducts(limit);
  },

  async getCustomerAnalytics(startDate: Date, endDate: Date) {
    const [growth, repeatRate] = await Promise.all([
      analyticsRepository.customerGrowth(startDate, endDate),
      analyticsRepository.repeatCustomerRate(),
    ]);
    return { ...growth, repeatCustomerRate: Math.round(repeatRate * 1000) / 10 }; // percentage, 1 decimal
  },

  async getAbandonedCarts(cursor: string | undefined, limit: number) {
    const { items, hasMore } = await analyticsRepository.abandonedCarts(cursor, limit);
    return { items, nextCursor: hasMore ? items[items.length - 1]?.id ?? null : null, hasMore };
  },

  // Called by the daily scheduled job (Phase 6 job runner) to snapshot
  // abandoned carts — kept here rather than in Cart module since it's an
  // analytics-owned entity (AbandonedCartSnapshot), not live cart state.
  async snapshotAbandonedCart(userId: string | undefined, cartItems: object, subtotal: number) {
    return analyticsRepository.createAbandonedCartSnapshot({ userId, cartItems, subtotal });
  },

  async exportSalesCsv(startDate: Date, endDate: Date): Promise<string> {
    const summary = await this.getSalesSummary(startDate, endDate);
    const topProducts = await this.getTopProducts(20);

    const sanitizeCell = (text: string) => {
      let str = String(text ?? '');
      if (str.startsWith('=') || str.startsWith('+') || str.startsWith('-') || str.startsWith('@')) {
        str = `'${str}`;
      }
      return `"${str.replace(/"/g, '""')}"`;
    };

    const lines = [
      'Metric,Value',
      `Total Revenue,${summary.totalRevenue}`,
      `Order Count,${summary.orderCount}`,
      `Average Order Value,${(summary.averageOrderValue || 0).toFixed(2)}`,
      '',
      'Product,Units Sold,Revenue',
      ...topProducts.map(
        (p: { productTitle: string; unitsSold: number; revenue: number }) =>
          `${sanitizeCell(p.productTitle)},${p.unitsSold},${(p.revenue || 0).toFixed(2)}`,
      ),
    ];
    return lines.join('\n');
  },
};
