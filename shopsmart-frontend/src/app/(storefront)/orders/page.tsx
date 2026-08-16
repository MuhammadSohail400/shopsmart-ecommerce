"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Package, Clock, CheckCircle2, AlertCircle, Truck, ArrowRight, ShoppingBag, ChevronRight } from 'lucide-react';
import { useOrders } from '@/features/orders/hooks/use-orders';
import { buttonVariants } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { OrderStatus } from '@/types/checkout.types';

// ─── Status helpers (mirroring backend OrderStatus enum) ─────────────────────
function getStatusConfig(status: OrderStatus) {
  const map: Record<OrderStatus, { label: string; color: string; icon: React.ElementType }> = {
    pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: Clock },
    confirmed: { label: 'Confirmed', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: CheckCircle2 },
    processing: { label: 'Processing', color: 'bg-indigo-100 text-indigo-700 border-indigo-200', icon: Package },
    shipped: { label: 'Shipped', color: 'bg-purple-100 text-purple-700 border-purple-200', icon: Truck },
    delivered: { label: 'Delivered', color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle2 },
    cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700 border-red-200', icon: AlertCircle },
    disputed: { label: 'Disputed', color: 'bg-orange-100 text-orange-700 border-orange-200', icon: AlertCircle },
    refunded: { label: 'Refunded', color: 'bg-gray-100 text-gray-600 border-gray-200', icon: ArrowRight },
  };
  return map[status] ?? { label: status, color: 'bg-muted text-muted-foreground', icon: Package };
}

const STATUS_FILTERS = [
  { value: undefined, label: 'All Orders' },
  { value: 'pending' as OrderStatus, label: 'Pending' },
  { value: 'confirmed' as OrderStatus, label: 'Confirmed' },
  { value: 'shipped' as OrderStatus, label: 'Shipped' },
  { value: 'delivered' as OrderStatus, label: 'Delivered' },
  { value: 'cancelled' as OrderStatus, label: 'Cancelled' },
];

export default function OrdersPage() {
  const [activeFilter, setActiveFilter] = useState<OrderStatus | undefined>(undefined);

  const { data, isLoading, isError, error } = useOrders({
    status: activeFilter,
    limit: 20,
  });

  const orders = data?.data ?? [];

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-3">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-foreground font-medium">My Orders</span>
        </div>
        <h1 className="text-2xl font-bold">Order History</h1>
        <p className="text-muted-foreground text-sm mt-1">Track and manage all your past orders.</p>
      </div>

      {/* Status filter tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {STATUS_FILTERS.map(({ value, label }) => (
          <button
            key={label}
            onClick={() => setActiveFilter(value)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${
              activeFilter === value
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-background text-muted-foreground border-border hover:border-primary/50 hover:text-foreground'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 w-full rounded-xl" />
          ))}
        </div>
      )}

      {/* Error state */}
      {isError && !isLoading && (
        <Card>
          <CardContent className="py-12 text-center">
            <AlertCircle className="h-10 w-10 text-destructive mx-auto mb-3" />
            <p className="font-semibold mb-1">Could not load orders</p>
            <p className="text-sm text-muted-foreground mb-4">
              {error instanceof Error ? error.message : 'Please sign in to view your orders.'}
            </p>
            <Link href="/auth/login" className={buttonVariants({ size: 'sm' })}>
              Sign In
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Empty state */}
      {!isLoading && !isError && orders.length === 0 && (
        <Card>
          <CardContent className="py-16 text-center">
            <div className="p-5 rounded-full bg-muted inline-flex mb-5">
              <ShoppingBag className="h-10 w-10 text-muted-foreground" />
            </div>
            <p className="font-semibold text-lg mb-1">No orders yet</p>
            <p className="text-sm text-muted-foreground mb-6">
              {activeFilter
                ? `No ${activeFilter} orders found.`
                : "You haven't placed any orders yet. Start shopping!"}
            </p>
            <Link href="/products" className={buttonVariants()}>
              Browse Products
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Order list */}
      {!isLoading && !isError && orders.length > 0 && (
        <div className="space-y-3">
          {orders.map((order) => {
            const cfg = getStatusConfig(order.status);
            const StatusIcon = cfg.icon;
            const total = Number(order.totalAmount);
            const itemCount = order.items?.length ?? 0;

            return (
              <Link key={order.id} href={`/orders/${order.id}`} className="block group">
                <Card className="transition-all hover:shadow-md hover:border-primary/30 group-hover:translate-y-[-1px]">
                  <CardContent className="py-4 px-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="font-bold font-mono text-sm">{order.orderNumber}</span>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${cfg.color}`}>
                            <StatusIcon className="h-3 w-3" />
                            {cfg.label}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {new Date(order.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                          {itemCount > 0 && ` · ${itemCount} item${itemCount !== 1 ? 's' : ''}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-bold text-base">${total.toFixed(2)}</p>
                          <p className="text-xs text-muted-foreground">Total</p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}

          {data?.pagination?.hasMore && (
            <p className="text-center text-sm text-muted-foreground pt-2">
              Showing first 20 orders.{' '}
              <span className="text-primary">Pagination coming soon.</span>
            </p>
          )}
        </div>
      )}
    </div>
  );
}
