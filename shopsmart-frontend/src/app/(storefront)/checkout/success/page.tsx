"use client";

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  CheckCircle2, Package, Clock, AlertCircle, ArrowRight, 
  ShoppingBag, MapPin, Truck, Loader2, Scissors, MessageCircle, ShieldCheck
} from 'lucide-react';
import { useOrder } from '@/features/orders/hooks/use-orders';
import { Button, buttonVariants } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { OrderStatus } from '@/types/checkout.types';
import { formatCurrency } from '@/lib/utils';

function getOrderStatusConfig(status: OrderStatus) {
  const map: Record<OrderStatus, { label: string; color: string; icon: React.ElementType }> = {
    pending: { label: 'PENDING CONFIRMATION', color: 'bg-amber-950/40 text-amber-400 border-amber-800/80', icon: Clock },
    confirmed: { label: 'ORDER CONFIRMED', color: 'bg-emerald-950/40 text-emerald-400 border-emerald-800/80', icon: CheckCircle2 },
    processing: { label: 'IN PRODUCTION / PACKING', color: 'bg-rose-950/40 text-rose-400 border-rose-800/80', icon: Package },
    shipped: { label: 'DISPATCHED & ON WAY', color: 'bg-purple-950/40 text-purple-400 border-purple-800/80', icon: Truck },
    delivered: { label: 'DELIVERED', color: 'bg-emerald-950/40 text-emerald-400 border-emerald-800/80', icon: CheckCircle2 },
    cancelled: { label: 'CANCELLED', color: 'bg-rose-950/40 text-rose-500 border-rose-800/80', icon: AlertCircle },
    disputed: { label: 'DISPUTED', color: 'bg-amber-950/40 text-amber-400 border-amber-800/80', icon: AlertCircle },
    refunded: { label: 'REFUNDED', color: 'bg-zinc-900 text-zinc-400 border-zinc-800', icon: ArrowRight },
  };
  return map[status] ?? { label: status?.toUpperCase() || 'CONFIRMED', color: 'bg-zinc-900 text-zinc-300 border-zinc-800', icon: Package };
}

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get('orderId');
  const orderNumber = searchParams.get('orderNumber');

  const { data: order, isLoading, isError } = useOrder(orderId);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 container max-w-2xl mx-auto py-16 px-4 text-center space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-rose-500 mx-auto mb-4" />
        <p className="text-sm font-mono text-zinc-400">Loading your ASORA order details...</p>
        <Skeleton className="h-48 w-full bg-zinc-900 rounded" />
      </div>
    );
  }

  // Fallback confirmation view if guest is not authenticated for detail query
  if (isError || !order) {
    const displayNum = orderNumber || orderId || `ASORA-${Date.now().toString().slice(-6)}`;
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center py-16 px-4">
        <div className="max-w-xl w-full text-center space-y-6">
          <div className="h-20 w-20 rounded-full bg-zinc-900 border border-zinc-800 text-rose-500 flex items-center justify-center mx-auto">
            <CheckCircle2 className="h-10 w-10 text-emerald-400" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-emerald-400 font-mono text-[10px] font-bold uppercase tracking-widest">
              ORDER PLACED
            </div>
            <h1 className="text-3xl sm:text-4xl font-black font-sans tracking-tight text-zinc-100 uppercase">
              ORDER CONFIRMED.
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto">
              Your order is on its way to becoming part of your story.
            </p>
          </div>

          <div className="p-4 rounded bg-zinc-900 border border-zinc-800 max-w-sm mx-auto">
            <span className="text-[10px] font-mono text-zinc-500 uppercase block">ORDER NUMBER</span>
            <span className="text-sm font-mono font-bold text-rose-400 block mt-0.5">{displayNum}</span>
          </div>

          <p className="text-[11px] font-mono text-zinc-400 max-w-sm mx-auto">
            You will receive SMS and WhatsApp tracking updates as soon as your package is dispatched.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link
              href="/products"
              className={buttonVariants({
                className: "bg-rose-600 hover:bg-rose-700 text-white font-mono font-bold text-xs uppercase tracking-wider h-11 px-6 rounded shadow-xl gap-2",
              })}
            >
              <ShoppingBag className="h-4 w-4" />
              <span>CONTINUE SHOPPING</span>
            </Link>
            <a
              href={`https://wa.me/923110297772?text=${encodeURIComponent(`Hi ASORA! I just placed order #${displayNum}`)}`}
              target="_blank"
              rel="noreferrer"
              className={buttonVariants({
                variant: "outline",
                className: "border-zinc-800 bg-zinc-900 text-emerald-400 hover:bg-zinc-850 font-mono font-bold text-xs uppercase tracking-wider h-11 px-6 rounded gap-2",
              })}
            >
              <MessageCircle className="h-4 w-4 text-emerald-400" />
              <span>WHATSAPP SUPPORT</span>
            </a>
          </div>
        </div>
      </div>
    );
  }

  const statusConfig = getOrderStatusConfig(order.status);
  const StatusIcon = statusConfig.icon;
  const shippingAddr = order.shippingAddress;
  const items = order.items || [];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 pb-20">
      <div className="container max-w-3xl mx-auto py-8 sm:py-12 px-4 sm:px-6 space-y-6">
        
        {/* Header Hero */}
        <div className="text-center space-y-3">
          <div className="h-16 w-16 rounded-full bg-emerald-950/40 border border-emerald-800/60 text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="h-8 w-8" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-zinc-900 border border-zinc-800 text-emerald-400 font-mono text-[10px] font-bold uppercase tracking-widest">
            {statusConfig.label}
          </div>

          <h1 className="text-3xl sm:text-4xl font-black font-sans tracking-tight text-zinc-100 uppercase">
            ORDER CONFIRMED.
          </h1>

          <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto">
            Your order is on its way to becoming part of your story.
          </p>
        </div>

        {/* Order Meta Bar */}
        <div className="p-4 rounded bg-zinc-900 border border-zinc-800 flex flex-wrap justify-between items-center gap-3 text-xs font-mono">
          <div>
            <span className="text-zinc-500 uppercase block text-[10px]">ORDER NUMBER</span>
            <span className="text-zinc-100 font-bold">{order.orderNumber}</span>
          </div>
          <div>
            <span className="text-zinc-500 uppercase block text-[10px]">ORDER DATE</span>
            <span className="text-zinc-100 font-bold">
              {new Date(order.createdAt || Date.now()).toLocaleDateString('en-PK', { dateStyle: 'medium' })}
            </span>
          </div>
          <div>
            <span className="text-zinc-500 uppercase block text-[10px]">PAYMENT</span>
            <span className="text-rose-400 font-bold">
              {order.payments?.[0]?.method?.toUpperCase() || 'CASH ON DELIVERY'}
            </span>
          </div>
          <div>
            <span className="text-zinc-500 uppercase block text-[10px]">TOTAL AMOUNT</span>
            <span className="text-zinc-100 font-bold">{formatCurrency(order.totalAmount)}</span>
          </div>
        </div>

        {/* ── ORDER ITEMS LIST ── */}
        <div className="p-6 rounded bg-zinc-900 border border-zinc-800 space-y-4">
          <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300 border-b border-zinc-850 pb-3">
            ORDERED PIECES ({items.length})
          </h2>

          <div className="space-y-3">
            {items.map((item: any) => {
              const isCustom = Boolean(item.customConfig);
              const custom = item.customConfig;
              const imageUrl = custom?.previewUrl || custom?.designUrl || item.productVariant?.product?.images?.[0]?.url || '/images/asora-hero.jpg';

              return (
                <div
                  key={item.id}
                  className="p-3.5 rounded bg-zinc-950 border border-zinc-800 flex gap-3 text-left justify-between items-center"
                >
                  <div className="flex gap-3 items-center">
                    <div className="w-16 h-20 bg-zinc-900 rounded border border-zinc-800 shrink-0 overflow-hidden flex items-center justify-center p-1">
                      <img
                        src={imageUrl}
                        alt="Product piece"
                        className="object-contain w-full h-full"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/images/asora-hero.jpg';
                        }}
                      />
                    </div>

                    <div className="space-y-1 text-left">
                      {isCustom ? (
                        <div>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-rose-600/10 border border-rose-500/20 text-rose-400 font-mono text-[9px] font-bold uppercase tracking-wider mb-1">
                            <Scissors className="h-2.5 w-2.5" /> CUSTOM ASORA TEE
                          </span>
                          <p className="text-xs font-bold font-mono text-zinc-100 uppercase">
                            {custom?.color} • {custom?.size} • {custom?.printPosition?.replace('_', ' + ').toUpperCase()}
                          </p>
                        </div>
                      ) : (
                        <div>
                          <p className="text-xs font-bold text-zinc-100 uppercase">
                            {item.productVariant?.product?.title || 'ASORA STREETWEAR PIECE'}
                          </p>
                          {item.productVariant?.attributes && (
                            <p className="text-[10px] font-mono text-zinc-400">
                              {Object.values(item.productVariant.attributes).join(' / ')}
                            </p>
                          )}
                        </div>
                      )}
                      <span className="text-[11px] font-mono text-zinc-400 block">
                        Qty: {item.quantity} × {formatCurrency(item.priceAtPurchase)}
                      </span>
                    </div>
                  </div>

                  <span className="font-mono font-bold text-xs text-zinc-100">
                    {formatCurrency(item.priceAtPurchase * item.quantity)}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Pricing Totals */}
          <div className="space-y-2 text-xs font-mono border-t border-zinc-850 pt-3">
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
              <span>GRAND TOTAL:</span>
              <span className="text-rose-500 font-mono text-base">{formatCurrency(order.totalAmount)}</span>
            </div>
          </div>
        </div>

        {/* Shipping Address Summary */}
        {shippingAddr && (
          <div className="p-5 rounded bg-zinc-900 border border-zinc-800 text-left space-y-2 text-xs font-mono">
            <span className="text-[10px] text-zinc-500 uppercase block font-bold">
              DELIVERY DESTINATION:
            </span>
            <p className="text-zinc-200 font-bold">{shippingAddr.fullName} ({shippingAddr.phone})</p>
            <p className="text-zinc-400">{shippingAddr.line1}, {shippingAddr.city}, {shippingAddr.region}, {shippingAddr.country}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Link
            href="/products"
            className={buttonVariants({
              className: "bg-rose-600 hover:bg-rose-700 text-white font-mono font-bold text-xs uppercase tracking-wider h-11 px-6 rounded shadow-xl gap-2",
            })}
          >
            <ShoppingBag className="h-4 w-4" />
            <span>CONTINUE SHOPPING</span>
          </Link>
          <Link
            href="/orders"
            className={buttonVariants({
              variant: "outline",
              className: "border-zinc-800 bg-zinc-900 text-zinc-200 hover:bg-zinc-850 font-mono font-bold text-xs uppercase tracking-wider h-11 px-6 rounded gap-2",
            })}
          >
            <Package className="h-4 w-4 text-rose-500" />
            <span>VIEW ALL ORDERS</span>
          </Link>
        </div>

      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
        </div>
      }
    >
      <CheckoutSuccessContent />
    </Suspense>
  );
}
