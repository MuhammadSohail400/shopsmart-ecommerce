"use client";

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  Truck, Search, Package, Clock, CheckCircle2, AlertCircle, 
  XCircle, ArrowRight, ShieldCheck, Phone, MapPin, Sparkles, Loader2 
} from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Breadcrumbs } from '@/components/shared/breadcrumbs';
import { useTrackOrder } from '@/features/orders/hooks/use-orders';
import { formatCurrency, resolveMediaUrl } from '@/lib/utils';
import { CustomGarmentThumbnail } from '@/components/storefront/custom-garment-thumbnail';
import { OrderStatus } from '@/types/checkout.types';

function getStatusBadge(status: OrderStatus) {
  const map: Record<OrderStatus, { label: string; color: string; icon: React.ElementType }> = {
    pending: { label: 'PENDING CONFIRMATION', color: 'bg-amber-950/50 text-amber-400 border-amber-800', icon: Clock },
    confirmed: { label: 'CONFIRMED & QUEUED', color: 'bg-emerald-950/50 text-emerald-400 border-emerald-800', icon: CheckCircle2 },
    processing: { label: 'IN PRODUCTION', color: 'bg-rose-950/50 text-rose-400 border-rose-800', icon: Package },
    shipped: { label: 'DISPATCHED / IN TRANSIT', color: 'bg-purple-950/50 text-purple-400 border-purple-800', icon: Truck },
    delivered: { label: 'DELIVERED', color: 'bg-emerald-950/50 text-emerald-400 border-emerald-800', icon: CheckCircle2 },
    cancelled: { label: 'CANCELLED', color: 'bg-rose-950/50 text-rose-500 border-rose-800', icon: XCircle },
    disputed: { label: 'DISPUTED', color: 'bg-amber-950/50 text-amber-400 border-amber-800', icon: AlertCircle },
    refunded: { label: 'REFUNDED', color: 'bg-zinc-900 text-zinc-400 border-zinc-800', icon: ArrowRight },
  };
  return map[status] ?? { label: status?.toUpperCase() || 'ORDER', color: 'bg-zinc-900 text-zinc-300 border-zinc-800', icon: Package };
}

function TrackOrderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('order') || searchParams.get('id') || '';

  const [inputQuery, setInputQuery] = useState(initialQuery);
  const [activeQuery, setActiveQuery] = useState(initialQuery);

  const { data: order, isLoading, isError, error } = useTrackOrder(activeQuery);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputQuery.trim()) return;
    setActiveQuery(inputQuery.trim());
  };

  const statusConfig = order ? getStatusBadge(order.status) : null;
  const StatusIcon = statusConfig?.icon || Package;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 pb-20">
      <div className="container max-w-4xl mx-auto py-6 sm:py-10 px-4 sm:px-6 space-y-6 sm:space-y-8">
        
        {/* Breadcrumbs */}
        <Breadcrumbs items={[
          { label: 'HOME', href: '/' },
          { label: 'ORDERS', href: '/orders' },
          { label: 'TRACK ORDER', href: '/orders/track' },
        ]} className="text-zinc-500 font-mono text-[11px]" />

        {/* Page Hero */}
        <div className="text-center space-y-2 max-w-lg mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-zinc-900 border border-zinc-800 text-rose-500 text-[10px] sm:text-[11px] font-mono font-bold tracking-widest uppercase">
            <Truck className="h-3.5 w-3.5" /> LIVE DISPATCH TRACKING
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-zinc-100 uppercase">
            TRACK YOUR ORDER
          </h1>
          <p className="text-xs sm:text-sm font-mono text-zinc-400">
            Enter your ASORA Order Number (e.g. <span className="text-rose-400">ASORA-20260829-...</span>) to track live status, production timeline, and shipment updates without logging in.
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-xl mx-auto bg-zinc-900/90 border border-zinc-800 p-3 sm:p-4 rounded-xl shadow-2xl backdrop-blur">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <Input
                type="text"
                placeholder="Enter Order Number (e.g. ASORA-20260829-XLCZLV)"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                className="pl-10 h-11 bg-zinc-950 border-zinc-800 text-zinc-100 font-mono text-xs placeholder:text-zinc-600 focus-visible:ring-rose-500 rounded"
              />
            </div>
            <Button
              type="submit"
              disabled={isLoading || !inputQuery.trim()}
              className="h-11 px-6 bg-rose-600 hover:bg-rose-700 text-white font-mono font-bold text-xs uppercase tracking-wider rounded gap-2 shrink-0 shadow-lg shadow-rose-950/50"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Truck className="h-4 w-4" />}
              <span>TRACK STATUS</span>
            </Button>
          </form>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="p-12 rounded-xl bg-zinc-900 border border-zinc-800 text-center space-y-3 max-w-xl mx-auto">
            <Loader2 className="h-8 w-8 animate-spin text-rose-500 mx-auto" />
            <p className="text-xs font-mono text-zinc-400 uppercase tracking-wider">Locating order records...</p>
          </div>
        )}

        {/* Error State */}
        {isError && !isLoading && activeQuery && (
          <div className="p-8 rounded-xl bg-zinc-900 border border-rose-950/60 text-center space-y-3 max-w-xl mx-auto shadow-xl">
            <AlertCircle className="h-8 w-8 text-rose-500 mx-auto" />
            <h3 className="text-sm font-mono font-bold uppercase text-zinc-100">ORDER NOT FOUND</h3>
            <p className="text-xs font-mono text-zinc-400">
              We couldn&apos;t find an order matching <strong className="text-zinc-200 font-mono">{activeQuery}</strong>. Please check your order confirmation on WhatsApp or SMS.
            </p>
          </div>
        )}

        {/* Live Order Result Card */}
        {order && !isLoading && (
          <div className="max-w-2xl mx-auto rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden shadow-2xl space-y-0 animate-in fade-in-50 duration-300">
            
            {/* Order Card Header */}
            <div className="p-4 sm:p-6 bg-gradient-to-r from-zinc-900 via-zinc-900 to-zinc-950 border-b border-zinc-800 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
              <div className="min-w-0">
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block">ORDER NUMBER</span>
                <h2 className="text-base sm:text-xl font-mono font-black text-zinc-100 tracking-tight break-all sm:break-normal">
                  {order.orderNumber}
                </h2>
                <p className="text-[11px] font-mono text-zinc-400 mt-0.5">
                  Placed on {new Date(order.createdAt).toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>

              {statusConfig && (
                <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-mono font-bold uppercase shadow-sm self-start sm:self-auto shrink-0 ${statusConfig.color}`}>
                  <StatusIcon className="h-3.5 w-3.5" />
                  <span>{statusConfig.label}</span>
                </div>
              )}
            </div>

            {/* Content Body */}
            <div className="p-4 sm:p-6 space-y-5 sm:space-y-6">
              
              {/* Shipment / Courier info if available */}
              {order.shipment && (
                <div className="p-3.5 rounded-lg bg-purple-950/30 border border-purple-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <Truck className="h-5 w-5 text-purple-400 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-mono font-bold text-zinc-100 uppercase truncate">
                        Carrier: {order.shipment.carrier || 'TCS / Leopards Courier'}
                      </p>
                      <p className="text-[10px] font-mono text-purple-300 truncate">
                        Tracking No: {order.shipment.trackingNumber || 'Assigned upon dispatch'}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-purple-900/50 text-purple-200 self-start sm:self-auto shrink-0">
                    {(order.shipment as any)?.status?.toUpperCase() || 'IN TRANSIT'}
                  </span>
                </div>
              )}

              {/* Items List */}
              <div className="space-y-3">
                <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-zinc-400 block">
                  ORDERED PIECES ({order.items?.length || 0})
                </span>

                <div className="space-y-2.5">
                  {order.items?.map((item: any) => {
                    const isCustom = Boolean(item.customConfig);
                    const custom = item.customConfig;
                    const itemTitle = isCustom
                      ? `ASORA Custom ${custom?.shirtType || 'Oversized'} T-Shirt`
                      : (item.productVariant?.product?.title || 'ASORA Streetwear Product');

                    return (
                      <div
                        key={item.id}
                        className="p-3 rounded-lg bg-zinc-950 border border-zinc-800/80 flex flex-col sm:flex-row items-start sm:items-center gap-3 justify-between"
                      >
                        <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1 w-full sm:w-auto">
                          <CustomGarmentThumbnail
                            imageUrl={item.productVariant?.product?.images?.[0]?.url}
                            title={itemTitle}
                            isCustom={isCustom}
                            customConfig={custom}
                            className="w-14 h-16 shrink-0 rounded"
                          />
                          <div className="min-w-0 flex-1">
                            <h4 className="text-xs font-mono font-bold text-zinc-100 line-clamp-2">
                              {itemTitle}
                            </h4>
                            <p className="text-[10px] font-mono text-zinc-400 mt-0.5">
                              {isCustom ? (
                                <>Color: <strong className="text-zinc-200">{custom?.color}</strong> • Size: <strong className="text-zinc-200">{custom?.size}</strong> • Print: <strong className="text-rose-400">{custom?.printPosition?.toUpperCase()}</strong></>
                              ) : (
                                <>Size: {item.productVariant?.attributes?.size || 'Standard'} • Color: {item.productVariant?.attributes?.color || 'Standard'}</>
                              )}
                            </p>
                            <span className="text-[10px] font-mono text-zinc-500 block pt-0.5">
                              Qty: {item.quantity} x {formatCurrency(item.priceAtPurchase || item.unitPrice || 0)}
                            </span>
                          </div>
                        </div>

                        <div className="font-mono font-bold text-xs text-zinc-100 self-end sm:self-center pt-1.5 sm:pt-0 border-t border-zinc-900 sm:border-t-0 w-full sm:w-auto flex sm:block justify-between sm:justify-end items-center">
                          <span className="text-[10px] text-zinc-500 font-normal sm:hidden">Total:</span>
                          <span className="text-rose-400 sm:text-zinc-100">{formatCurrency((item.priceAtPurchase || item.unitPrice || 0) * item.quantity)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Delivery Address & COD Total */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-zinc-800/80">
                <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 text-xs font-mono space-y-1">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">DELIVERY DESTINATION</span>
                  <p className="font-bold text-zinc-200">
                    {(order.shippingAddress as any)?.firstName} {(order.shippingAddress as any)?.lastName}
                  </p>
                  <p className="text-zinc-400 text-[11px] break-words">
                    {(order.shippingAddress as any)?.streetAddress || (order.shippingAddress as any)?.line1}, {(order.shippingAddress as any)?.city}
                  </p>
                  <p className="text-zinc-500 text-[10px]">
                    Phone: {(order.shippingAddress as any)?.phone}
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 text-xs font-mono flex flex-col justify-between">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wider">PAYMENT SUMMARY</span>
                  <div className="space-y-1 mt-1">
                    <div className="flex justify-between text-zinc-400 text-[11px]">
                      <span>Subtotal:</span>
                      <span>{formatCurrency(order.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-zinc-400 text-[11px]">
                      <span>Shipping:</span>
                      <span>{formatCurrency(order.shippingAmount)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-rose-400 text-sm border-t border-zinc-800 pt-1 mt-1">
                      <span>COD Due:</span>
                      <span>{formatCurrency(order.totalAmount)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <Link
                  href={`/orders/${order.id}`}
                  className={buttonVariants({
                    className: "flex-1 h-11 bg-rose-600 hover:bg-rose-700 text-white font-mono font-bold text-xs uppercase tracking-wider rounded justify-center gap-2",
                  })}
                >
                  <span>VIEW FULL ORDER PORTAL & INVOICE</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
        </div>
      }
    >
      <TrackOrderContent />
    </Suspense>
  );
}
