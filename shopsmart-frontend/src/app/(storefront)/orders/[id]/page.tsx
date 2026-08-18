"use client";

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Package,
  Clock,
  CheckCircle2,
  AlertCircle,
  Truck,
  ArrowRight,
  ArrowLeft,
  MapPin,
  ChevronRight,
  Loader2,
  XCircle,
} from 'lucide-react';
import { useOrder, useCancelOrder } from '@/features/orders/hooks/use-orders';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { Breadcrumbs } from '@/components/shared/breadcrumbs';
import { toast } from 'sonner';
import { OrderStatus } from '@/types/checkout.types';
import { ApiError } from '@/lib/api-client';
import { formatCurrency } from '@/lib/utils';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';

function getStatusConfig(status: OrderStatus) {
  const map: Record<OrderStatus, { label: string; color: string; icon: React.ElementType; desc: string }> = {
    pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: Clock, desc: 'Awaiting payment confirmation' },
    confirmed: { label: 'Confirmed', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: CheckCircle2, desc: 'Payment confirmed, preparing your order' },
    processing: { label: 'Processing', color: 'bg-indigo-100 text-indigo-700 border-indigo-200', icon: Package, desc: 'Your order is being packed' },
    shipped: { label: 'Shipped', color: 'bg-purple-100 text-purple-700 border-purple-200', icon: Truck, desc: 'Your order is on its way' },
    delivered: { label: 'Delivered', color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle2, desc: 'Your order has been delivered' },
    cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700 border-red-200', icon: XCircle, desc: 'This order was cancelled' },
    disputed: { label: 'Disputed', color: 'bg-orange-100 text-orange-700 border-orange-200', icon: AlertCircle, desc: 'A dispute is open on this order' },
    refunded: { label: 'Refunded', color: 'bg-gray-100 text-gray-600 border-gray-200', icon: ArrowRight, desc: 'A refund was issued' },
  };
  return map[status] ?? { label: status, color: 'bg-muted text-muted-foreground', icon: Package, desc: '' };
}


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

  // ── Loading ──────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="container max-w-3xl mx-auto py-8 px-4 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────────
  if (isError || !order) {
    return (
      <div className="container max-w-3xl mx-auto py-8 px-4">
        <Card>
          <CardContent className="py-12 text-center">
            <AlertCircle className="h-10 w-10 text-destructive mx-auto mb-3" />
            <p className="font-semibold mb-1">Order not found</p>
            <p className="text-sm text-muted-foreground mb-6">
              {error instanceof Error ? error.message : 'This order does not exist or you don\'t have permission to view it.'}
            </p>
            <Button variant="outline" onClick={() => router.push('/orders')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Orders
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statusConfig = getStatusConfig(order.status);
  const StatusIcon = statusConfig.icon;
  const isCancellable = CANCELLABLE_STATUSES.includes(order.status);
  const addr = order.shippingAddress;

  return (
    <div className="container max-w-3xl mx-auto py-8 px-4">
      {/* Breadcrumb */}
      <Breadcrumbs
        items={[{ label: 'My Orders', href: '/orders' }, { label: `#${order.orderNumber}` }]}
        className="mb-6"
      />

      <div className="space-y-4">
        {/* Status banner */}
        <Card>
          <CardContent className="py-5">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h1 className="text-lg font-bold font-mono">{order.orderNumber}</h1>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${statusConfig.color}`}>
                    <StatusIcon className="h-3.5 w-3.5" />
                    {statusConfig.label}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Placed on {new Date(order.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                  })}
                </p>
                {statusConfig.desc && (
                  <p className="text-sm text-muted-foreground mt-1">{statusConfig.desc}</p>
                )}
              </div>
              {/* Actions */}
              <div className="flex gap-2 flex-wrap shrink-0">
                {isCancellable && !showCancelConfirm && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive border-destructive/30 hover:bg-destructive/5"
                    onClick={() => setShowCancelConfirm(true)}
                  >
                    <XCircle className="h-4 w-4 mr-1.5" />
                    Cancel Order
                  </Button>
                )}
              </div>
            </div>

            {/* Cancellation confirm */}
            {showCancelConfirm && (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Cancel this order?</AlertTitle>
                <AlertDescription>
                  This cannot be undone. If payment was made, a refund will be processed by our team.
                  <div className="flex gap-2 mt-3">
                    <Button
                      size="sm"
                      variant="destructive"
                      disabled={cancelOrder.isPending}
                      onClick={handleCancel}
                    >
                      {cancelOrder.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Yes, Cancel Order'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowCancelConfirm(false)}
                      disabled={cancelOrder.isPending}
                    >
                      Keep Order
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Order items */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
              <Package className="h-4 w-4" />
              Items ({order.items.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between py-2 border-b last:border-0 gap-3">
                <div className="min-w-0">
                  <p className="text-sm text-muted-foreground font-mono truncate">
                    {item.productVariantId}
                  </p>
                  <p className="text-xs text-muted-foreground">Quantity: {item.quantity}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-semibold">{formatCurrency(Number(item.priceAtPurchase) * item.quantity)}</p>
                  <p className="text-xs text-muted-foreground">{formatCurrency(item.priceAtPurchase)} ea.</p>
                </div>
              </div>
            ))}

            <Separator />

            {/* Totals */}
            <div className="space-y-1.5 text-sm pt-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-bold">{formatCurrency(order.subtotal)}</span>
              </div>
              {Number(order.shippingAmount) > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>{formatCurrency(order.shippingAmount)}</span>
                </div>
              )}
              {Number(order.taxAmount) > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax</span>
                  <span>{formatCurrency(order.taxAmount)}</span>
                </div>
              )}
              {Number(order.discountAmount) > 0 && (
                <div className="flex justify-between text-green-600 font-bold">
                  <span>Discount</span>
                  <span>−{formatCurrency(order.discountAmount)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-bold text-base pt-1">
                <span>Total</span>
                <span className="text-primary font-black">{formatCurrency(order.totalAmount)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 2-column: address + shipment */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Shipping address */}
          {addr && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Shipping Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                <address className="not-italic text-sm leading-relaxed space-y-0.5">
                  <p className="font-medium">{addr.fullName}</p>
                  <p className="text-muted-foreground">{addr.line1}</p>
                  <p className="text-muted-foreground">
                    {addr.city}, {addr.region} {addr.postalCode}
                  </p>
                  <p className="text-muted-foreground">{addr.country}</p>
                  <p className="text-muted-foreground mt-1">{addr.phone}</p>
                </address>
              </CardContent>
            </Card>
          )}

          {/* Shipment / tracking */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                <Truck className="h-4 w-4" />
                Shipment
              </CardTitle>
            </CardHeader>
            <CardContent>
              {order.shipment ? (
                <div className="text-sm space-y-2">
                  {order.shipment.carrier && (
                    <div>
                      <p className="text-xs text-muted-foreground">Carrier</p>
                      <p className="font-medium">{order.shipment.carrier}</p>
                    </div>
                  )}
                  {order.shipment.trackingNumber && (
                    <div>
                      <p className="text-xs text-muted-foreground">Tracking Number</p>
                      <p className="font-mono font-medium">{order.shipment.trackingNumber}</p>
                    </div>
                  )}
                  {order.shipment.estimatedDelivery && (
                    <div>
                      <p className="text-xs text-muted-foreground">Estimated Delivery</p>
                      <p className="font-medium">
                        {new Date(order.shipment.estimatedDelivery).toLocaleDateString('en-US', {
                          month: 'short', day: 'numeric', year: 'numeric'
                        })}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Tracking information will appear here once your order ships.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Status history timeline */}
        {order.statusHistory && order.statusHistory.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Order Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[...order.statusHistory].reverse().map((h, i) => {
                  const cfg = getStatusConfig(h.status);
                  const Icon = cfg.icon;
                  return (
                    <div key={i} className="flex items-start gap-3">
                      <div className={`p-1.5 rounded-full border mt-0.5 ${cfg.color}`}>
                        <Icon className="h-3 w-3" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{cfg.label}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(h.changedAt).toLocaleString('en-US', {
                            month: 'short', day: 'numeric', year: 'numeric',
                            hour: '2-digit', minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Back button */}
        <Button variant="outline" onClick={() => router.push('/orders')} className="w-full sm:w-auto rounded-full">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Orders
        </Button>
      </div>
    </div>
  );
}

export default function OrderDetailPage() {
  return (
    <ProtectedRoute>
      <OrderDetailContent />
    </ProtectedRoute>
  );
}
