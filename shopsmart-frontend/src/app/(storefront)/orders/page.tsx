"use client";

import { useState } from 'react';
import Link from 'next/link';
import { 
  Package, Clock, CheckCircle2, AlertCircle, Truck, 
  ArrowRight, ShoppingBag, Scissors, ChevronRight, Loader2
} from 'lucide-react';
import { useOrders } from '@/features/orders/hooks/use-orders';
import { Button, buttonVariants } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { OrderStatus } from '@/types/checkout.types';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { Breadcrumbs } from '@/components/shared/breadcrumbs';
import { formatCurrency } from '@/lib/utils';

function getStatusConfig(status: OrderStatus) {
  const map: Record<OrderStatus, { label: string; color: string; icon: React.ElementType }> = {
    pending: { label: 'PENDING', color: 'bg-amber-950/40 text-amber-400 border-amber-800/80', icon: Clock },
    confirmed: { label: 'CONFIRMED', color: 'bg-emerald-950/40 text-emerald-400 border-emerald-800/80', icon: CheckCircle2 },
    processing: { label: 'PROCESSING', color: 'bg-rose-950/40 text-rose-400 border-rose-800/80', icon: Package },
    shipped: { label: 'SHIPPED', color: 'bg-purple-950/40 text-purple-400 border-purple-800/80', icon: Truck },
    delivered: { label: 'DELIVERED', color: 'bg-emerald-950/40 text-emerald-400 border-emerald-800/80', icon: CheckCircle2 },
    cancelled: { label: 'CANCELLED', color: 'bg-rose-950/40 text-rose-500 border-rose-800/80', icon: AlertCircle },
    disputed: { label: 'DISPUTED', color: 'bg-amber-950/40 text-amber-400 border-amber-800/80', icon: AlertCircle },
    refunded: { label: 'REFUNDED', color: 'bg-zinc-900 text-zinc-400 border-zinc-800', icon: ArrowRight },
  };
  return map[status] ?? { label: status?.toUpperCase() || 'ORDER', color: 'bg-zinc-900 text-zinc-300 border-zinc-800', icon: Package };
}

const STATUS_FILTERS = [
  { value: undefined, label: 'ALL ORDERS' },
  { value: 'pending' as OrderStatus, label: 'PENDING' },
  { value: 'confirmed' as OrderStatus, label: 'CONFIRMED' },
  { value: 'processing' as OrderStatus, label: 'PROCESSING' },
  { value: 'shipped' as OrderStatus, label: 'SHIPPED' },
  { value: 'delivered' as OrderStatus, label: 'DELIVERED' },
  { value: 'cancelled' as OrderStatus, label: 'CANCELLED' },
];

function OrdersContent() {
  const [activeFilter, setActiveFilter] = useState<OrderStatus | undefined>(undefined);

  const { data, isLoading, isError, error } = useOrders({
    status: activeFilter,
    limit: 20,
  });

  const orders = data?.data ?? [];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 pb-20">
      <div className="container max-w-4xl mx-auto py-6 sm:py-10 px-4 sm:px-6 space-y-6">
        
        {/* Breadcrumbs */}
        <Breadcrumbs items={[
          { label: 'HOME', href: '/' },
          { label: 'MY ORDERS', href: '/orders' },
        ]} className="text-zinc-500 font-mono text-[11px]" />

        {/* Header */}
        <div className="border-b border-zinc-850 pb-4">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-rose-400 text-[10px] font-mono font-bold uppercase tracking-widest mb-1">
            ACCOUNT ARCHIVE
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-100 uppercase">
            ORDER HISTORY
          </h1>
          <p className="text-xs font-mono text-zinc-400 mt-0.5">
            Track, review, and manage all your past ASORA drops and custom pieces.
          </p>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map(({ value, label }) => (
            <button
              key={label}
              type="button"
              onClick={() => setActiveFilter(value)}
              className={`px-3 py-1.5 rounded text-[10px] sm:text-xs font-mono font-bold uppercase transition-all ${
                activeFilter === value
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:border-zinc-700 hover:text-zinc-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 w-full bg-zinc-900 rounded border border-zinc-800" />
            ))}
          </div>
        )}

        {/* Error State */}
        {isError && !isLoading && (
          <div className="p-8 rounded bg-zinc-900 border border-zinc-800 text-center space-y-3">
            <AlertCircle className="h-8 w-8 text-rose-500 mx-auto" />
            <h3 className="text-sm font-mono font-bold uppercase text-zinc-100">COULD NOT LOAD ORDERS</h3>
            <p className="text-xs font-mono text-zinc-400">
              {error instanceof Error ? error.message : 'Please sign in to view your orders.'}
            </p>
            <Link
              href="/auth/login"
              className={buttonVariants({
                className: "bg-rose-600 hover:bg-rose-700 text-white font-mono text-xs uppercase font-bold px-6 h-10 rounded",
              })}
            >
              SIGN IN
            </Link>
          </div>
        )}

        {/* Empty Orders State */}
        {!isLoading && !isError && orders.length === 0 && (
          <div className="p-12 rounded bg-zinc-900 border border-zinc-800 text-center space-y-4">
            <div className="h-16 w-16 rounded-full bg-zinc-950 border border-zinc-800 text-zinc-500 flex items-center justify-center mx-auto">
              <Package className="h-8 w-8 text-rose-500" />
            </div>
            <h3 className="text-base font-mono font-bold uppercase text-zinc-100">
              NO ORDERS FOUND
            </h3>
            <p className="text-xs font-mono text-zinc-400 max-w-sm mx-auto">
              {activeFilter ? 'No orders match this status filter.' : 'You haven’t placed any orders yet. Discover our latest streetwear drops!'}
            </p>
            <Link
              href="/products"
              className={buttonVariants({
                className: "bg-rose-600 hover:bg-rose-700 text-white font-mono font-bold text-xs uppercase px-6 h-11 rounded shadow-xl gap-2",
              })}
            >
              <ShoppingBag className="h-4 w-4" />
              <span>SHOP ASORA COLLECTION</span>
            </Link>
          </div>
        )}

        {/* Orders List */}
        {!isLoading && orders.length > 0 && (
          <div className="space-y-4">
            {orders.map((order) => {
              const statusCfg = getStatusConfig(order.status);
              const items = order.items || [];
              const hasCustom = items.some((i: any) => Boolean(i.customConfig));

              return (
                <div
                  key={order.id}
                  className="p-5 rounded bg-zinc-900 border border-zinc-800 space-y-4 hover:border-zinc-700 transition-colors text-left"
                >
                  {/* Order Header */}
                  <div className="flex flex-wrap justify-between items-start gap-2 border-b border-zinc-850 pb-3">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-zinc-100">
                          {order.orderNumber}
                        </span>
                        {hasCustom && (
                          <span className="px-2 py-0.5 rounded bg-rose-600/10 border border-rose-500/20 text-rose-400 font-mono text-[9px] font-bold uppercase">
                            CUSTOM PIECE
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] font-mono text-zinc-500 block">
                        Placed on {new Date(order.createdAt).toLocaleDateString('en-PK', { dateStyle: 'medium' })}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold uppercase border ${statusCfg.color}`}>
                        {statusCfg.label}
                      </span>
                    </div>
                  </div>

                  {/* Items Preview */}
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-2 overflow-x-auto">
                      {items.slice(0, 4).map((item: any, idx: number) => {
                        const img = item.customConfig?.previewUrl || item.customConfig?.designUrl || item.productVariant?.product?.images?.[0]?.url || '/images/asora-hero.jpg';
                        return (
                          <div
                            key={item.id || idx}
                            className="w-12 h-14 bg-zinc-950 rounded border border-zinc-800 shrink-0 overflow-hidden flex items-center justify-center p-0.5"
                          >
                            <img src={img} alt="" className="object-contain w-full h-full" />
                          </div>
                        );
                      })}
                      {items.length > 4 && (
                        <span className="text-xs font-mono text-zinc-500 px-2">
                          +{items.length - 4} more
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-right">
                      <div>
                        <span className="text-[10px] font-mono text-zinc-500 uppercase block">TOTAL</span>
                        <span className="font-mono font-bold text-sm text-zinc-100">
                          {formatCurrency(order.totalAmount)}
                        </span>
                      </div>

                      <Link
                        href={`/orders/${order.id}`}
                        className={buttonVariants({
                          variant: "outline",
                          size: "sm",
                          className: "border-zinc-800 bg-zinc-950 text-zinc-200 hover:bg-zinc-850 font-mono text-xs uppercase h-9 px-3 gap-1",
                        })}
                      >
                        <span>VIEW DETAILS</span>
                        <ChevronRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>
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
