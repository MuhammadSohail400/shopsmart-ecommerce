"use client";

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, Package, Clock, AlertCircle, ArrowRight, ShoppingBag, MapPin, Truck, Loader2 } from 'lucide-react';
import { useOrder } from '@/features/orders/hooks/use-orders';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { OrderStatus } from '@/types/checkout.types';

// ─── Status helpers ────────────────────────────────────────────────────────────
function getOrderStatusConfig(status: OrderStatus) {
  const map: Record<OrderStatus, { label: string; color: string; icon: React.ElementType }> = {
    pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Clock },
    confirmed: { label: 'Confirmed', color: 'bg-blue-100 text-blue-800 border-blue-200', icon: CheckCircle2 },
    processing: { label: 'Processing', color: 'bg-indigo-100 text-indigo-800 border-indigo-200', icon: Package },
    shipped: { label: 'Shipped', color: 'bg-purple-100 text-purple-800 border-purple-200', icon: Truck },
    delivered: { label: 'Delivered', color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle2 },
    cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800 border-red-200', icon: AlertCircle },
    disputed: { label: 'Disputed', color: 'bg-orange-100 text-orange-800 border-orange-200', icon: AlertCircle },
    refunded: { label: 'Refunded', color: 'bg-gray-100 text-gray-700 border-gray-200', icon: ArrowRight },
  };
  return map[status] ?? { label: status, color: 'bg-muted text-muted-foreground', icon: Package };
}



// ─── Main success content ──────────────────────────────────────────────────────
function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get('orderId');
  const orderNumber = searchParams.get('orderNumber');

  const { data: order, isLoading, isError } = useOrder(orderId);

  // ── Loading ────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="container max-w-2xl mx-auto py-12 px-4">
        <div className="text-center mb-8">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your order details…</p>
        </div>
        <div className="space-y-4">
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  // ── Error / not found ──────────────────────────────────────────────────────
  // If we can't fetch the full order (e.g. guest without auth), still show
  // a basic confirmation so the user isn't left hanging.
  if (isError || !order) {
    return (
      <div className="container max-w-2xl mx-auto py-12 px-4 text-center">
        <div className="p-5 rounded-full bg-green-50 inline-flex mb-6">
          <CheckCircle2 className="h-14 w-14 text-green-500" />
        </div>
        <h1 className="text-3xl font-bold mb-3">Order Placed!</h1>
        <p className="text-muted-foreground mb-2 text-lg">Your order is being processed.</p>
        {(orderNumber || orderId) && (
          <p className="text-sm font-medium bg-muted inline-block px-4 py-2 rounded-lg mb-8 font-mono">
            Order #{orderNumber ?? orderId}
          </p>
        )}
        <p className="text-xs text-muted-foreground mb-8">
          You&apos;ll receive a confirmation email shortly. To view your full order details, please
          sign in to your account.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/products" className={buttonVariants({ variant: 'outline', size: 'lg' })}>
            <ShoppingBag className="h-4 w-4 mr-2" />
            Continue Shopping
          </Link>
          <Link href="/auth/login" className={buttonVariants({ size: 'lg' })}>
            Sign In to View Orders
          </Link>
        </div>
      </div>
    );
  }

  // ── Full success view ──────────────────────────────────────────────────────
  const statusConfig = getOrderStatusConfig(order.status);
  const StatusIcon = statusConfig.icon;
  const shippingAddr = order.shippingAddress;

  return (
    <div className="container max-w-2xl mx-auto py-10 px-4">
      {/* Hero */}
      <div className="text-center mb-8">
        <div className="p-5 rounded-full bg-green-50 inline-flex mb-5">
          <CheckCircle2 className="h-14 w-14 text-green-500" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Order Confirmed!</h1>
        <p className="text-muted-foreground">
          Thank you for your purchase. We&apos;ve received your order and it&apos;s being processed.
        </p>
      </div>

      <div className="space-y-4">
        {/* Order number + status */}
        <Card>
          <CardContent className="pt-5 pb-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Order Number</p>
                <p className="text-xl font-bold font-mono">{order.orderNumber}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Placed on {new Date(order.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric', month: 'long', day: 'numeric'
                  })}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border ${statusConfig.color}`}>
                  <StatusIcon className="h-3.5 w-3.5" />
                  {statusConfig.label}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Order items */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
              <Package className="h-4 w-4" />
              Items Ordered
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between items-center py-2 border-b last:border-0">
                <div>
                  <p className="text-sm font-medium">Item</p>
                  <p className="text-xs text-muted-foreground">
                    Variant ID: <span className="font-mono">{item.productVariantId.slice(0, 8)}…</span>
                    &nbsp;· Qty: {item.quantity}
                  </p>
                </div>
                <p className="text-sm font-semibold">
                  ${(Number(item.priceAtPurchase) * item.quantity).toFixed(2)}
                </p>
              </div>
            ))}

            <Separator />

            {/* Pricing breakdown */}
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>${Number(order.subtotal).toFixed(2)}</span>
              </div>
              {Number(order.shippingAmount) > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>${Number(order.shippingAmount).toFixed(2)}</span>
                </div>
              )}
              {Number(order.taxAmount) > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax</span>
                  <span>${Number(order.taxAmount).toFixed(2)}</span>
                </div>
              )}
              {Number(order.discountAmount) > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>−${Number(order.discountAmount).toFixed(2)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-bold text-base">
                <span>Total</span>
                <span>${Number(order.totalAmount).toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Shipping address */}
        {shippingAddr && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Shipping Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              <address className="not-italic text-sm leading-relaxed">
                <p className="font-medium">{shippingAddr.fullName}</p>
                <p className="text-muted-foreground">{shippingAddr.line1}</p>
                <p className="text-muted-foreground">
                  {shippingAddr.city}, {shippingAddr.region} {shippingAddr.postalCode}
                </p>
                <p className="text-muted-foreground">{shippingAddr.country}</p>
                <p className="text-muted-foreground mt-1">{shippingAddr.phone}</p>
              </address>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => router.push(`/orders/${order.id}`)}
          >
            <Package className="h-4 w-4 mr-2" />
            View Full Order
          </Button>
          <Link href="/products" className={`flex-1 ${buttonVariants({ size: 'default' })}`}>
            <ShoppingBag className="h-4 w-4 mr-2" />
            Continue Shopping
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
        <div className="container max-w-2xl mx-auto py-12 text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading…</p>
        </div>
      }
    >
      <CheckoutSuccessContent />
    </Suspense>
  );
}
