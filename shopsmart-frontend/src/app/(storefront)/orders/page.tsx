"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Package, Clock, CheckCircle2, AlertCircle, Truck, ArrowRight, ShoppingBag } from 'lucide-react';
import { useOrders } from '@/features/orders/hooks/use-orders';
import { buttonVariants } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { OrderStatus } from '@/types/checkout.types';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { Breadcrumbs } from '@/components/shared/breadcrumbs';
import { formatCurrency } from '@/lib/utils';

// ─── Status helpers (mirroring backend OrderStatus enum) ─────────────────────
function getStatusConfig(status: OrderStatus) {
  const map: Record<OrderStatus, { label: string; color: string; icon: React.ElementType }> = {
    pending: { label: 'Pending', color: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20', icon: Clock },
    confirmed: { label: 'Confirmed', color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20', icon: CheckCircle2 },
    processing: { label: 'Processing', color: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20', icon: Package },
    shipped: { label: 'Shipped', color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20', icon: Truck },
    delivered: { label: 'Delivered', color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20', icon: CheckCircle2 },
    cancelled: { label: 'Cancelled', color: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20', icon: AlertCircle },
    disputed: { label: 'Disputed', color: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20', icon: AlertCircle },
    refunded: { label: 'Refunded', color: 'bg-muted text-muted-foreground border-border', icon: ArrowRight },
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

function OrdersContent() {
  const [activeFilter, setActiveFilter] = useState<OrderStatus | undefined>(undefined);

  const { data, isLoading, isError, error } = useOrders({
    status: activeFilter,
    limit: 20,
  });

  const orders = data?.data ?? [];

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      {/* Breadcrumbs */}
      <Breadcrumbs items={[{ label: 'My Orders' }]} className="mb-6" />

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight">Order History</h1>
        <p className="text-muted-foreground text-sm mt-1">Track, review, and manage all your past orders.</p>
      </div>

      {/* Status filter tabs */}
      <div className="flex flex-wrap gap-2 mb-8">
        {STATUS_FILTERS.map(({ value, label }) => (
          <button
            key={label}
            onClick={() => setActiveFilter(value)}
            className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all border ${
              activeFilter === value
                ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                : 'bg-background text-muted-foreground border-border/80 hover:border-primary/50 hover:text-foreground'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 w-full rounded-2xl" />
          ))}
        </div>
      )}

      {/* Error state */}
      {isError && !isLoading && (
        <Card className="rounded-2xl border-border/60">
          <CardContent className="py-12 text-center">
            <div className="p-4 rounded-full bg-destructive/10 text-destructive mx-auto w-fit mb-4">
              <AlertCircle className="h-8 w-8" />
            </div>
            <h3 className="font-bold text-lg mb-1">Could not load orders</h3>
            <p className="text-sm text-muted-foreground mb-6">
              {error instanceof Error ? error.message : 'Please try again.'}
            </p>
            <Link href="/login" className={buttonVariants({ size: 'sm', className: 'rounded-full px-6' })}>
              Sign In
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Empty state */}
      {!isLoading && !isError && orders.length === 0 && (
        <div className="text-center py-16 px-4 rounded-3xl border border-dashed border-border/80 bg-card/40">
          <div className="p-6 rounded-full bg-secondary/40 text-muted-foreground/40 mx-auto w-fit mb-4">
            <ShoppingBag className="h-12 w-12" />
          </div>
          <h3 className="font-extrabold text-xl mb-2">No orders found</h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-6">
            {activeFilter
              ? `You don't have any orders with "${activeFilter}" status.`
              : "You haven't placed any orders yet. Discover our curated catalog today!"}
          </p>
          <Link
            href="/products"
            className={buttonVariants({ className: 'rounded-full px-8 font-semibold shadow-md' })}
          >
            Start Shopping
          </Link>
        </div>
      )}

      {/* Orders list */}
      {!isLoading && !isError && orders.length > 0 && (
        <div className="space-y-4">
          {orders.map((order) => {
            const statusConfig = getStatusConfig(order.status as OrderStatus);
            const StatusIcon = statusConfig.icon;
            const formattedDate = new Date(order.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            });
            const formattedTotal = formatCurrency(order.totalAmount);

            return (
              <Link
                key={order.id}
                href={`/orders/${order.id}`}
                className="block group"
              >
                <Card className="rounded-2xl border-border/60 hover:border-primary/50 hover:shadow-md transition-all duration-200">
                  <CardContent className="p-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      {/* Left: order info */}
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-base group-hover:text-primary transition-colors">
                            Order #{order.id.slice(-8).toUpperCase()}
                          </span>
                          <span
                            className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full border ${statusConfig.color}`}
                          >
                            <StatusIcon className="h-3 w-3" />
                            {statusConfig.label}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Placed on {formattedDate} • {order.items?.length ?? 0}{' '}
                          {(order.items?.length ?? 0) === 1 ? 'item' : 'items'}
                        </p>
                      </div>

                      {/* Right: price & arrow */}
                      <div className="flex items-center justify-between sm:justify-end gap-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/40">
                        <span className="font-extrabold text-lg">{formattedTotal}</span>
                        <div className="flex items-center text-xs font-semibold text-primary gap-1 group-hover:translate-x-0.5 transition-transform">
                          Details
                          <ArrowRight className="h-3.5 w-3.5" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function OrdersPage() {
  return (
    <ProtectedRoute>
      <OrdersContent />
    </ProtectedRoute>
  );
}
