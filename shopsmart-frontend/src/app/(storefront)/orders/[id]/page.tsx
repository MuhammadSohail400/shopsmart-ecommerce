"use client";

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Package, Clock, CheckCircle2, AlertCircle, Truck, 
  ArrowRight, ArrowLeft, MapPin, ChevronRight, Loader2, 
  XCircle, Scissors, MessageCircle, ShieldCheck
} from 'lucide-react';
import { useOrder, useCancelOrder } from '@/features/orders/hooks/use-orders';
import { Button, buttonVariants } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { Breadcrumbs } from '@/components/shared/breadcrumbs';
import { toast } from 'sonner';
import { OrderStatus } from '@/types/checkout.types';
import { ApiError } from '@/lib/api-client';
import { formatCurrency, resolveMediaUrl } from '@/lib/utils';
import { CustomGarmentThumbnail } from '@/components/storefront/custom-garment-thumbnail';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

function getStatusConfig(status: OrderStatus) {
  const map: Record<OrderStatus, { label: string; color: string; icon: React.ElementType; desc: string }> = {
    pending: { label: 'PENDING CONFIRMATION', color: 'bg-amber-950/40 text-amber-400 border-amber-800/80', icon: Clock, desc: 'Awaiting payment verification or courier dispatch assignment' },
    confirmed: { label: 'ORDER CONFIRMED', color: 'bg-emerald-950/40 text-emerald-400 border-emerald-800/80', icon: CheckCircle2, desc: 'Order verified and queued for production' },
    processing: { label: 'IN PRODUCTION / PACKING', color: 'bg-rose-950/40 text-rose-400 border-rose-800/80', icon: Package, desc: 'Your garment is being printed, quality checked and boxed' },
    shipped: { label: 'DISPATCHED & IN TRANSIT', color: 'bg-purple-950/40 text-purple-400 border-purple-800/80', icon: Truck, desc: 'Your package is on its way with the courier' },
    delivered: { label: 'DELIVERED', color: 'bg-emerald-950/40 text-emerald-400 border-emerald-800/80', icon: CheckCircle2, desc: 'Package delivered safely to your doorstep' },
    cancelled: { label: 'CANCELLED', color: 'bg-rose-950/40 text-rose-500 border-rose-800/80', icon: XCircle, desc: 'This order was cancelled' },
    disputed: { label: 'DISPUTED', color: 'bg-amber-950/40 text-amber-400 border-amber-800/80', icon: AlertCircle, desc: 'A support dispute is active' },
    refunded: { label: 'REFUNDED', color: 'bg-zinc-900 text-zinc-400 border-zinc-800', icon: ArrowRight, desc: 'Payment has been refunded' },
  };
  return map[status] ?? { label: status?.toUpperCase() || 'CONFIRMED', color: 'bg-zinc-900 text-zinc-300 border-zinc-800', icon: Package, desc: 'Order update in progress' };
}

const TIMELINE_STEPS: Array<{ key: OrderStatus; label: string }> = [
  { key: 'pending', label: 'ORDER PLACED' },
  { key: 'confirmed', label: 'CONFIRMED' },
  { key: 'processing', label: 'PRODUCTION' },
  { key: 'shipped', label: 'DISPATCHED' },
  { key: 'delivered', label: 'DELIVERED' },
];

const CANCELLABLE_STATUSES: OrderStatus[] = ['pending', 'confirmed'];

function OrderDetailContent() {
  const params = useParams();
  const router = useRouter();
  const orderId = typeof params.id === 'string' ? params.id : '';

  const { data: order, isLoading, isError, error } = useOrder(orderId);
  const cancelOrder = useCancelOrder();
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const handleCancel = () => {
    if (!orderId) return;
    cancelOrder.mutate(
      { orderId },
      {
        onSuccess: () => {
          toast.success('Order cancelled successfully.');
          setShowCancelConfirm(false);
        },
        onError: (err) => {
          const message = err instanceof ApiError ? err.userMessage : err.message;
          toast.error('Cancellation failed', { description: message });
          setShowCancelConfirm(false);
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 container max-w-4xl mx-auto py-10 px-4 space-y-4">
        <Skeleton className="h-6 w-32 bg-zinc-800" />
        <Skeleton className="h-32 w-full bg-zinc-900 rounded border border-zinc-800" />
        <Skeleton className="h-64 w-full bg-zinc-900 rounded border border-zinc-800" />
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center py-20 px-4 text-center">
        <div className="max-w-md space-y-4">
          <AlertCircle className="h-10 w-10 text-rose-500 mx-auto" />
          <h1 className="text-xl font-mono font-bold uppercase text-zinc-100">ORDER NOT FOUND</h1>
          <p className="text-xs font-mono text-zinc-400">
            {error instanceof Error ? error.message : 'Could not find the requested order details.'}
          </p>
          <Link
            href="/orders"
            className={buttonVariants({
              className: "bg-rose-600 hover:bg-rose-700 text-white font-mono text-xs uppercase font-bold px-6 h-10 rounded",
            })}
          >
            BACK TO ALL ORDERS
          </Link>
        </div>
      </div>
    );
  }

  const statusConfig = getStatusConfig(order.status);
  const StatusIcon = statusConfig.icon;
  const isCancellable = CANCELLABLE_STATUSES.includes(order.status);
  const items = order.items || [];
  const shippingAddr = order.shippingAddress;

  // Determine current timeline progress index
  const currentStepIdx = TIMELINE_STEPS.findIndex(s => s.key === order.status);
  const activeTimelineIdx = currentStepIdx >= 0 ? currentStepIdx : (order.status === 'delivered' ? 4 : 0);

  const whatsappUrl = `https://wa.me/923110297772?text=${encodeURIComponent(
    `Hi ASORA! I am inquiring about Order #${order.orderNumber}.`
  )}`;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 pb-20">
      <div className="container max-w-4xl mx-auto py-5 sm:py-10 px-3.5 sm:px-6 space-y-5 sm:space-y-6">
        
        {/* Breadcrumbs */}
        <Breadcrumbs items={[
          { label: 'HOME', href: '/' },
          { label: 'MY ORDERS', href: '/orders' },
          { label: order.orderNumber, href: '#' },
        ]} className="text-zinc-500 font-mono text-[11px]" />

        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-3 border-b border-zinc-800 pb-4">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-rose-400 text-[10px] font-mono font-bold uppercase tracking-widest mb-1.5">
              ORDER ARCHIVE
            </div>
            <h1 className="text-xl sm:text-3xl font-black tracking-tight text-zinc-100 uppercase break-all sm:break-normal">
              ORDER {order.orderNumber}
            </h1>
            <p className="text-xs font-mono text-zinc-400 mt-1">
              Placed on {new Date(order.createdAt).toLocaleDateString('en-PK', { dateStyle: 'full' })}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 pt-1 sm:pt-0 shrink-0">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className={buttonVariants({
                variant: "outline",
                size: "sm",
                className: "border-emerald-900/40 bg-emerald-950/30 hover:bg-emerald-900/40 text-emerald-400 font-mono text-[11px] sm:text-xs uppercase h-9 px-2.5 sm:px-3 gap-1.5 justify-center",
              })}
            >
              <MessageCircle className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">WHATSAPP</span>
            </a>

            {isCancellable && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowCancelConfirm(true)}
                className="border-zinc-800 bg-zinc-900 text-rose-400 hover:bg-zinc-850 font-mono text-[11px] sm:text-xs uppercase h-9 px-2.5 sm:px-3 truncate justify-center"
              >
                CANCEL ORDER
              </Button>
            )}
          </div>
        </div>

        {/* ── 5-STAGE ORDER TIMELINE ── */}
        {order.status !== 'cancelled' && order.status !== 'refunded' && (
          <div className="p-4 sm:p-6 rounded-xl bg-zinc-900 border border-zinc-800 space-y-4 text-left shadow-lg">
            <div className="flex flex-wrap justify-between items-center gap-2">
              <span className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider">
                LIVE ORDER TRACKING
              </span>
              <span className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${statusConfig.color}`}>
                {statusConfig.label}
              </span>
            </div>

            {/* Stepper with progress bar */}
            <div className="relative pt-2 pb-1">
              {/* Progress Line */}
              <div className="absolute top-[22px] left-[10%] right-[10%] h-0.5 bg-zinc-800 -z-0">
                <div 
                  className="h-full bg-emerald-500 transition-all duration-500"
                  style={{ width: `${(Math.max(0, activeTimelineIdx) / (TIMELINE_STEPS.length - 1)) * 100}%` }}
                />
              </div>

              <div className="grid grid-cols-5 gap-1 sm:gap-2 relative z-10">
                {TIMELINE_STEPS.map((step, idx) => {
                  const isPassed = idx <= activeTimelineIdx;
                  const isCurrent = idx === activeTimelineIdx;

                  return (
                    <div key={step.key} className="space-y-1.5 text-center flex flex-col items-center">
                      <div
                        className={`h-7 w-7 sm:h-8 sm:w-8 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-mono font-bold transition-all shadow-md ${
                          isCurrent
                            ? 'bg-rose-600 text-white ring-4 ring-rose-950 scale-105'
                            : isPassed
                            ? 'bg-emerald-600 text-white'
                            : 'bg-zinc-950 border border-zinc-800 text-zinc-600'
                        }`}
                      >
                        {isPassed ? <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> : idx + 1}
                      </div>
                      <span className={`text-[8px] sm:text-[10px] font-mono font-bold uppercase block leading-tight tracking-tight px-0.5 ${
                        isCurrent ? 'text-rose-400' : isPassed ? 'text-zinc-200' : 'text-zinc-600'
                      }`}>
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <p className="text-[11px] sm:text-xs font-mono text-zinc-400 border-t border-zinc-800/80 pt-3">
              Status Note: <span className="text-zinc-200">{statusConfig.desc}</span>
            </p>
          </div>
        )}

        {/* ── ORDERED PIECES & CUSTOM DETAILS ── */}
        <div className="p-4 sm:p-6 rounded-xl bg-zinc-900 border border-zinc-800 space-y-4 text-left shadow-lg">
          <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300 border-b border-zinc-800 pb-3">
            ORDERED PIECES ({items.length})
          </h2>

          <div className="space-y-3">
            {items.map((item: any) => {
              const isCustom = Boolean(item.customConfig);
              const custom = item.customConfig;

              return (
                <div
                  key={item.id}
                  className="p-3.5 sm:p-4 rounded-lg bg-zinc-950 border border-zinc-800 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-between items-start sm:items-center"
                >
                  <div className="flex gap-3 sm:gap-4 items-start min-w-0 flex-1 w-full sm:w-auto">
                    <CustomGarmentThumbnail
                      imageUrl={item.productVariant?.product?.images?.[0]?.url}
                      title="Garment piece"
                      isCustom={isCustom}
                      customConfig={custom}
                      className="w-16 h-20 sm:w-20 sm:h-24 shrink-0 rounded"
                    />

                    <div className="space-y-1 text-left min-w-0 flex-1">
                      {isCustom ? (
                        <div>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-rose-600/10 border border-rose-500/20 text-rose-400 font-mono text-[9px] sm:text-[10px] font-bold uppercase tracking-wider mb-1">
                            <Scissors className="h-3 w-3 shrink-0" /> CUSTOM ASORA TEE
                          </span>
                          <h3 className="text-xs sm:text-sm font-bold font-mono text-zinc-100 uppercase line-clamp-2">
                            {custom?.shirtType?.toUpperCase() || 'OVERSIZED'} CUSTOM T-SHIRT
                          </h3>
                          <div className="text-[10px] sm:text-[11px] font-mono text-zinc-400 space-y-0.5 mt-1">
                            <p>Color: <span className="text-zinc-200">{custom?.color}</span> • Size: <span className="text-zinc-200">{custom?.size}</span></p>
                            <p>Print Placement: <span className="text-rose-400">{custom?.printPosition?.replace('_', ' + ').toUpperCase()}</span></p>
                            {custom?.designUrl && (
                              <a
                                href={resolveMediaUrl(custom.designUrl)}
                                target="_blank"
                                rel="noreferrer"
                                className="text-rose-400 hover:underline text-[10px] font-mono block pt-0.5 truncate"
                              >
                                View Uploaded Artwork File ↗
                              </a>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div>
                          <h3 className="text-xs sm:text-sm font-bold font-mono text-zinc-100 uppercase line-clamp-2">
                            {item.productVariant?.product?.title || 'ASORA STREETWEAR PIECE'}
                          </h3>
                          {item.productVariant?.attributes && (
                            <p className="text-[10px] sm:text-[11px] font-mono text-zinc-400">
                              {Object.entries(item.productVariant.attributes).map(([k, v]) => `${k}: ${v}`).join(' • ')}
                            </p>
                          )}
                        </div>
                      )}
                      <span className="text-[11px] sm:text-xs font-mono text-zinc-400 block pt-1">
                        Quantity: <span className="text-zinc-200 font-bold">{item.quantity}</span> × {formatCurrency(item.priceAtPurchase)}
                      </span>
                    </div>
                  </div>

                  <div className="font-mono font-bold text-xs sm:text-sm text-zinc-100 self-end sm:self-center pt-2 sm:pt-0 border-t border-zinc-900 sm:border-t-0 w-full sm:w-auto flex sm:block justify-between sm:justify-end items-center">
                    <span className="text-[10px] text-zinc-500 font-normal sm:hidden">Item Total:</span>
                    <span className="text-rose-400 sm:text-zinc-100">{formatCurrency(item.priceAtPurchase * item.quantity)}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pricing Totals */}
          <div className="space-y-2 text-xs font-mono border-t border-zinc-800 pt-3">
            <div className="flex justify-between text-zinc-400">
              <span>Subtotal:</span>
              <span className="text-zinc-200">{formatCurrency(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-zinc-400">
              <span>Shipping Fee:</span>
              <span className="text-zinc-200">
                {Number(order.shippingAmount) === 0 ? 'FREE' : formatCurrency(order.shippingAmount)}
              </span>
            </div>
            {Number(order.discountAmount) > 0 && (
              <div className="flex justify-between text-rose-400">
                <span>Discount:</span>
                <span>-{formatCurrency(order.discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-black text-zinc-100 border-t border-zinc-800 pt-2 mt-2">
              <span>ORDER TOTAL:</span>
              <span className="text-rose-500 font-mono text-base">{formatCurrency(order.totalAmount)}</span>
            </div>
          </div>
        </div>

        {/* ── SHIPPING & PAYMENT INFO CARDS ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-left">
          {/* Destination */}
          <div className="p-4 sm:p-5 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2 text-xs font-mono shadow-md">
            <span className="text-[10px] text-zinc-500 uppercase block font-bold flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-rose-500 shrink-0" />
              <span>SHIPPING ADDRESS</span>
            </span>
            {shippingAddr ? (
              <div className="space-y-1">
                <p className="text-zinc-100 font-bold">{shippingAddr.fullName}</p>
                <p className="text-zinc-300">{shippingAddr.phone}</p>
                <p className="text-zinc-400 break-words">{shippingAddr.line1}, {shippingAddr.city}, {shippingAddr.region}, {shippingAddr.country}</p>
              </div>
            ) : (
              <p className="text-zinc-500">Shipping details not recorded.</p>
            )}
          </div>

          {/* Payment */}
          <div className="p-4 sm:p-5 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2 text-xs font-mono shadow-md">
            <span className="text-[10px] text-zinc-500 uppercase block font-bold flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-rose-500 shrink-0" />
              <span>PAYMENT DETAILS</span>
            </span>
            <div className="space-y-1">
              <p className="text-rose-400 font-bold">
                {order.payments?.[0]?.method?.toUpperCase() || 'CASH ON DELIVERY'}
              </p>
              <p className="text-zinc-400">
                Status: <span className="text-zinc-200 capitalize">{order.payments?.[0]?.status || 'Pending Delivery'}</span>
              </p>
              <p className="text-zinc-500 text-[10px]">
                Paid via official nationwide logistics courier.
              </p>
            </div>
          </div>
        </div>

        {/* Cancel Confirmation Modal */}
        <Dialog open={showCancelConfirm} onOpenChange={setShowCancelConfirm}>
          <DialogContent className="bg-zinc-950 border-zinc-800 text-zinc-100">
            <DialogHeader>
              <DialogTitle className="font-mono font-black uppercase text-rose-500">
                CANCEL ORDER #{order.orderNumber}
              </DialogTitle>
              <DialogDescription className="text-zinc-400 text-xs font-mono mt-2">
                Are you sure you want to cancel this order? This action cannot be undone and any reserved inventory will be released.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 sm:gap-0 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCancelConfirm(false)}
                className="border-zinc-800 bg-zinc-900 text-zinc-300 font-mono text-xs uppercase"
              >
                KEEP ORDER
              </Button>
              <Button
                type="button"
                disabled={cancelOrder.isPending}
                onClick={handleCancel}
                className="bg-rose-600 hover:bg-rose-700 text-white font-mono text-xs uppercase font-bold"
              >
                {cancelOrder.isPending ? 'CANCELLING...' : 'YES, CANCEL ORDER'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </div>
    </div>
  );
}

export default function OrderDetailPage() {
  return <OrderDetailContent />;
}
