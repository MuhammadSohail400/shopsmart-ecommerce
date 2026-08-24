"use client";

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useCart, useClearCart } from '@/features/cart/hooks/use-cart';
import {
  useCreateCheckoutSession,
  useConfirmCheckoutSession,
} from '@/features/checkout/hooks/use-checkout';
import { env } from '@/config/env';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  ChevronRight,
  AlertCircle,
  ShoppingBag,
  CreditCard,
  Truck,
  Building2,
  CheckCircle2,
  ArrowLeft,
  Package,
  Lock,
  Scissors,
  ShieldCheck,
  Banknote,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { CheckoutSession, ConfirmCheckoutResult } from '@/types/checkout.types';
import { Skeleton } from '@/components/ui/skeleton';
import { ApiError } from '@/lib/api-client';
import { formatCurrency } from '@/lib/utils';
import { Breadcrumbs } from '@/components/shared/breadcrumbs';

// ─── Stripe setup ──────────────────────────────────────────────────────────────
const isStripeConfigured =
  Boolean(env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) &&
  !env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.includes('your_stripe_publishable_key_here');

const stripePromise = isStripeConfigured
  ? loadStripe(env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null;

// ─── Pakistan Shipping Form Schema ─────────────────────────────────────────────
const shippingSchema = z.object({
  fullName: z.string().min(2, 'Full name is required (at least 2 characters)').max(255),
  phone: z.string().min(10, 'Valid Pakistani mobile number required (e.g., 0300 1234567)').max(20),
  line1: z.string().min(5, 'Complete street address is required').max(255),
  city: z.string().min(2, 'City is required').max(100),
  region: z.string().min(2, 'Province/Region is required').max(100),
  postalCode: z.string().max(20).optional(),
  country: z.string().min(2).max(2),
  shippingMethod: z.enum(['standard', 'express']),
});

type ShippingFormData = z.infer<typeof shippingSchema>;

const PAKISTAN_PROVINCES = [
  'Punjab',
  'Sindh',
  'Khyber Pakhtunkhwa',
  'Balochistan',
  'Islamabad Capital Territory',
  'Gilgit-Baltistan',
  'Azad Jammu & Kashmir',
];

const MAJOR_CITIES = [
  'Karachi',
  'Lahore',
  'Islamabad',
  'Rawalpindi',
  'Faisalabad',
  'Multan',
  'Peshawar',
  'Quetta',
  'Sialkot',
  'Gujranwala',
  'Hyderabad',
  'Abbottabad',
  'Bahawalpur',
  'Sargodha',
  'Sukkur',
];

// ─── Stripe Payment Form Component ─────────────────────────────────────────────
function StripePaymentForm({
  sessionData,
  onSuccess,
  onError,
  onBack,
}: {
  sessionData: CheckoutSession;
  onSuccess: (result: ConfirmCheckoutResult) => void;
  onError: (message: string) => void;
  onBack: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleStripeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements || isProcessing) return;
    setIsProcessing(true);

    const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
    });

    if (stripeError) {
      setIsProcessing(false);
      onError(stripeError.message ?? 'Payment failed. Please try again.');
      return;
    }

    if (paymentIntent && paymentIntent.status === 'succeeded') {
      onSuccess({
        order: {
          id: sessionData.sessionId,
          orderNumber: `ASORA-${Date.now().toString().slice(-6)}`,
          status: 'confirmed',
          subtotal: sessionData.subtotal,
          taxAmount: sessionData.taxAmount,
          shippingAmount: sessionData.shippingAmount,
          discountAmount: sessionData.discountAmount,
          totalAmount: sessionData.totalAmount,
          shippingAddress: {
            fullName: 'Customer',
            phone: '',
            line1: '',
            city: '',
            region: '',
            country: 'PK',
          },
          items: [],
          createdAt: new Date().toISOString(),
        },
        payment: {
          id: paymentIntent.id,
          orderId: sessionData.sessionId,
          method: 'card',
          status: 'succeeded',
          amount: sessionData.totalAmount,
          createdAt: new Date().toISOString(),
        },
      });
    } else {
      setIsProcessing(false);
      onError('Payment could not be confirmed. Please check your card.');
    }
  };

  return (
    <form onSubmit={handleStripeSubmit} className="space-y-6">
      <div className="p-6 rounded bg-zinc-900 border border-zinc-800 space-y-4">
        <div className="border-b border-zinc-850 pb-3">
          <h3 className="text-sm font-mono font-bold uppercase text-zinc-100 flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-rose-500" />
            <span>CARD PAYMENT DETAILS</span>
          </h3>
          <p className="text-[11px] font-mono text-zinc-400 mt-0.5">
            Encrypted 256-bit SSL transaction powered by Stripe.
          </p>
        </div>

        <div className="bg-zinc-950 p-4 rounded border border-zinc-800">
          <PaymentElement options={{ layout: 'tabs' }} />
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-zinc-850 gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            disabled={isProcessing}
            className="border-zinc-800 bg-zinc-900 text-zinc-300 font-mono text-xs uppercase h-11 px-5"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            BACK
          </Button>

          <Button
            type="submit"
            disabled={!stripe || !elements || isProcessing}
            className="bg-rose-600 hover:bg-rose-700 text-white font-mono font-black text-xs uppercase tracking-widest h-11 px-6 rounded shadow-xl"
          >
            {isProcessing ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                PROCESSING...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                PAY {formatCurrency(sessionData.totalAmount)}
              </span>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}

// ─── Main Checkout Page ────────────────────────────────────────────────────────
export default function CheckoutPage() {
  const router = useRouter();
  const { data: cart, isLoading: isCartLoading } = useCart();
  const clearCart = useClearCart();

  // Checkout Step: 1 = Shipping info, 2 = Payment selection
  const [step, setStep] = useState<1 | 2>(1);
  const [sessionData, setSessionData] = useState<CheckoutSession | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'card' | 'bank_transfer'>('cod');
  const [globalError, setGlobalError] = useState<string | null>(null);

  const idempotencyKeyRef = useRef<string>(crypto.randomUUID());
  const createSession = useCreateCheckoutSession();
  const confirmSession = useConfirmCheckoutSession();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ShippingFormData>({
    resolver: zodResolver(shippingSchema),
    defaultValues: {
      shippingMethod: 'standard',
      country: 'PK',
      region: 'Punjab',
      city: 'Lahore',
    },
  });

  // Step 1: Create session with customer shipping details
  const onSubmitShipping = useCallback((data: ShippingFormData) => {
    setGlobalError(null);
    const { shippingMethod, ...guestAddress } = data;

    createSession.mutate(
      { guestAddress, shippingMethod },
      {
        onSuccess: (session) => {
          setSessionData(session);
          if ((session as any).clientSecret) {
            setClientSecret((session as any).clientSecret);
          }
          setStep(2);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        },
        onError: (err) => {
          const message = err instanceof ApiError ? err.userMessage : err.message;
          setGlobalError(message);
          toast.error('Checkout Error', { description: message });
        },
      }
    );
  }, [createSession]);

  // Step 2: Confirm non-card orders (Cash on Delivery or Bank Transfer)
  const onConfirmNonCard = useCallback(() => {
    if (!sessionData) return;
    setGlobalError(null);

    confirmSession.mutate(
      {
        sessionId: sessionData.sessionId,
        data: { paymentMethod },
        idempotencyKey: idempotencyKeyRef.current,
      },
      {
        onSuccess: (result) => {
          toast.success('Order placed successfully!');
          clearCart.mutate(undefined, {
            onSettled: () => {
              router.push(
                `/checkout/success?orderId=${result.order.id}&orderNumber=${result.order.orderNumber}`
              );
            },
          });
        },
        onError: (err) => {
          const message = err instanceof ApiError ? err.userMessage : err.message;
          setGlobalError(message);
          toast.error('Order Placement Failed', { description: message });
          idempotencyKeyRef.current = crypto.randomUUID();
        },
      }
    );
  }, [sessionData, paymentMethod, confirmSession, clearCart, router]);

  // Card payment success handler
  const onCardSuccess = useCallback((result: ConfirmCheckoutResult) => {
    toast.success('Card payment confirmed!');
    clearCart.mutate(undefined, {
      onSettled: () => {
        router.push(
          `/checkout/success?orderId=${result.order.id}&orderNumber=${result.order.orderNumber}`
        );
      },
    });
  }, [clearCart, router]);

  if (isCartLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 container max-w-6xl mx-auto py-10 px-4">
        <Skeleton className="h-8 w-48 bg-zinc-800 mb-8 rounded" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <Skeleton className="lg:col-span-7 h-96 bg-zinc-900 rounded" />
          <Skeleton className="lg:col-span-5 h-96 bg-zinc-900 rounded" />
        </div>
      </div>
    );
  }

  const items = cart?.items || [];
  const cartSubtotal = cart?.subtotal || 0;
  const appliedCoupon = cart?.appliedCoupon || null;
  if (items.length === 0 && !sessionData) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center py-20 px-4 text-center">
        <div className="max-w-md space-y-4">
          <div className="p-4 rounded-full bg-zinc-900 border border-zinc-800 text-rose-500 w-fit mx-auto">
            <ShoppingBag className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-black font-mono uppercase text-zinc-100">
            YOUR CART IS EMPTY
          </h1>
          <p className="text-xs text-zinc-400">
            Add items to your cart before proceeding to checkout.
          </p>
          <Link
            href="/products"
            className={buttonVariants({
              className: "bg-rose-600 hover:bg-rose-700 text-white font-mono text-xs uppercase font-bold px-6 h-10 rounded",
            })}
          >
            BROWSE COLLECTION
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 pb-20">
      <div className="container max-w-6xl mx-auto py-6 sm:py-10 px-4 sm:px-6 space-y-8">
        
        {/* Breadcrumbs */}
        <Breadcrumbs items={[
          { label: 'HOME', href: '/' },
          { label: 'CART', href: '/cart' },
          { label: 'CHECKOUT', href: '/checkout' },
        ]} className="text-zinc-500 font-mono text-[11px]" />

        {/* Checkout Header */}
        <div className="border-b border-zinc-850 pb-4 flex justify-between items-end">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-rose-400 text-[10px] font-mono font-bold uppercase tracking-widest mb-1">
              SECURE CHECKOUT
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-100 uppercase">
              COMPLETE YOUR ORDER
            </h1>
          </div>
          
          <div className="hidden sm:flex items-center gap-2 text-xs font-mono">
            <span className={`px-2.5 py-1 rounded font-bold ${step === 1 ? 'bg-rose-600 text-white' : 'bg-zinc-900 text-zinc-400 border border-zinc-800'}`}>
              01 SHIPPING
            </span>
            <ChevronRight className="h-4 w-4 text-zinc-600" />
            <span className={`px-2.5 py-1 rounded font-bold ${step === 2 ? 'bg-rose-600 text-white' : 'bg-zinc-900 text-zinc-400 border border-zinc-800'}`}>
              02 PAYMENT
            </span>
          </div>
        </div>

        {/* Global Error Notice */}
        {globalError && (
          <div className="p-4 rounded bg-rose-950/40 border border-rose-800/80 text-rose-300 text-xs font-mono flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-rose-500 shrink-0" />
            <span>{globalError}</span>
          </div>
        )}

        {/* ── 2-COLUMN CHECKOUT GRID ──────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: Checkout Steps / Forms (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* ── STEP 1: SHIPPING DETAILS ── */}
            {step === 1 && (
              <form onSubmit={handleSubmit(onSubmitShipping)} className="space-y-6">
                <div className="p-6 rounded bg-zinc-900 border border-zinc-800 space-y-4">
                  <div className="border-b border-zinc-850 pb-3">
                    <h2 className="text-sm font-mono font-bold uppercase text-zinc-100 flex items-center gap-2">
                      <Truck className="h-4 w-4 text-rose-500" />
                      <span>STEP 01 — SHIPPING ADDRESS (PAKISTAN)</span>
                    </h2>
                    <p className="text-[11px] font-mono text-zinc-400 mt-0.5">
                      Enter your delivery address for nationwide dispatch.
                    </p>
                  </div>

                  <div className="space-y-4 text-left">
                    {/* Full Name */}
                    <div>
                      <Label htmlFor="fullName" className="text-xs font-mono uppercase text-zinc-300">
                        Full Name *
                      </Label>
                      <Input
                        id="fullName"
                        placeholder="e.g. Ali Ahmed"
                        {...register('fullName')}
                        className="mt-1 bg-zinc-950 border-zinc-800 text-zinc-100 font-mono text-xs h-11"
                      />
                      {errors.fullName && (
                        <p className="text-[11px] font-mono text-rose-500 mt-1">{errors.fullName.message}</p>
                      )}
                    </div>

                    {/* Phone Number */}
                    <div>
                      <Label htmlFor="phone" className="text-xs font-mono uppercase text-zinc-300">
                        Mobile Phone Number (for courier dispatch & tracking) *
                      </Label>
                      <Input
                        id="phone"
                        placeholder="0300 1234567"
                        {...register('phone')}
                        className="mt-1 bg-zinc-950 border-zinc-800 text-zinc-100 font-mono text-xs h-11"
                      />
                      {errors.phone && (
                        <p className="text-[11px] font-mono text-rose-500 mt-1">{errors.phone.message}</p>
                      )}
                    </div>

                    {/* Address Line */}
                    <div>
                      <Label htmlFor="line1" className="text-xs font-mono uppercase text-zinc-300">
                        Street Address / House No / Apartment *
                      </Label>
                      <Input
                        id="line1"
                        placeholder="House #12, Street 4, Sector F-7"
                        {...register('line1')}
                        className="mt-1 bg-zinc-950 border-zinc-800 text-zinc-100 font-mono text-xs h-11"
                      />
                      {errors.line1 && (
                        <p className="text-[11px] font-mono text-rose-500 mt-1">{errors.line1.message}</p>
                      )}
                    </div>

                    {/* City & Province Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="city" className="text-xs font-mono uppercase text-zinc-300">
                          City *
                        </Label>
                        <Input
                          id="city"
                          placeholder="e.g. Lahore"
                          {...register('city')}
                          className="mt-1 bg-zinc-950 border-zinc-800 text-zinc-100 font-mono text-xs h-11"
                        />
                        {errors.city && (
                          <p className="text-[11px] font-mono text-rose-500 mt-1">{errors.city.message}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="region" className="text-xs font-mono uppercase text-zinc-300">
                          Province / Region *
                        </Label>
                        <select
                          id="region"
                          {...register('region')}
                          className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded px-3 text-zinc-100 font-mono text-xs h-11 focus:outline-hidden focus:border-rose-500"
                        >
                          {PAKISTAN_PROVINCES.map((prov) => (
                            <option key={prov} value={prov} className="bg-zinc-900 text-zinc-100">
                              {prov}
                            </option>
                          ))}
                        </select>
                        {errors.region && (
                          <p className="text-[11px] font-mono text-rose-500 mt-1">{errors.region.message}</p>
                        )}
                      </div>
                    </div>

                    {/* Quick City Presets */}
                    <div className="pt-1">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block mb-1.5">
                        Quick Select City:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {MAJOR_CITIES.slice(0, 8).map((c) => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => setValue('city', c)}
                            className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-950 hover:bg-zinc-800 text-zinc-400 border border-zinc-800 transition-colors"
                          >
                            {c}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Delivery Option */}
                    <div className="pt-3 border-t border-zinc-850">
                      <Label className="text-xs font-mono uppercase text-zinc-300 block mb-2">
                        Delivery Method
                      </Label>
                      <div className="p-3.5 rounded bg-zinc-950 border border-rose-500/40 flex justify-between items-center">
                        <div className="space-y-0.5">
                          <span className="text-xs font-bold font-mono text-zinc-100 block uppercase">
                            Standard Nationwide Courier (3–5 Days)
                          </span>
                          <span className="text-[10px] font-mono text-zinc-400 block">
                            Direct dispatch with doorstep tracking
                          </span>
                        </div>
                        <span className="text-xs font-mono font-bold text-rose-400">
                          PKR 200 / FREE over 2.5k
                        </span>
                      </div>
                    </div>

                  </div>

                  <div className="pt-4 border-t border-zinc-850">
                    <Button
                      type="submit"
                      disabled={createSession.isPending}
                      className="w-full h-12 bg-rose-600 hover:bg-rose-700 text-white font-mono font-black text-xs uppercase tracking-widest rounded shadow-xl flex items-center justify-center gap-2"
                    >
                      {createSession.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>PROCESSING DETAILS...</span>
                        </>
                      ) : (
                        <>
                          <span>CONTINUE TO PAYMENT</span>
                          <ChevronRight className="h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </form>
            )}

            {/* ── STEP 2: PAYMENT METHOD SELECTION ── */}
            {step === 2 && sessionData && (
              <div className="space-y-6">
                
                {/* Back to Shipping button */}
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs font-mono text-zinc-400 hover:text-rose-400 flex items-center gap-1.5 uppercase transition-colors"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>EDIT SHIPPING ADDRESS</span>
                </button>

                <div className="p-6 rounded bg-zinc-900 border border-zinc-800 space-y-4">
                  <div className="border-b border-zinc-850 pb-3">
                    <h2 className="text-sm font-mono font-bold uppercase text-zinc-100 flex items-center gap-2">
                      <Lock className="h-4 w-4 text-rose-500" />
                      <span>STEP 02 — SELECT PAYMENT METHOD</span>
                    </h2>
                    <p className="text-[11px] font-mono text-zinc-400 mt-0.5">
                      Choose how you would like to pay for your ASORA order.
                    </p>
                  </div>

                  {/* Payment Method Cards */}
                  <div className="space-y-3">
                    {/* COD */}
                    <label
                      onClick={() => setPaymentMethod('cod')}
                      className={`p-4 rounded border flex items-start justify-between cursor-pointer transition-all ${
                        paymentMethod === 'cod'
                          ? 'bg-zinc-950 border-rose-500 shadow-md'
                          : 'bg-zinc-950/50 border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex gap-3">
                        <div className="h-5 w-5 rounded-full border-2 border-rose-500 flex items-center justify-center mt-0.5">
                          {paymentMethod === 'cod' && <div className="h-2.5 w-2.5 rounded-full bg-rose-500" />}
                        </div>
                        <div>
                          <span className="text-xs font-bold font-mono text-zinc-100 uppercase block">
                            CASH ON DELIVERY (COD)
                          </span>
                          <span className="text-[11px] font-mono text-zinc-400 block mt-0.5">
                            Pay in cash to the rider when your package arrives at your doorstep.
                          </span>
                        </div>
                      </div>
                      <Banknote className="h-5 w-5 text-rose-400 shrink-0" />
                    </label>

                    {/* Stripe / Card */}
                    {isStripeConfigured && (
                      <label
                        onClick={() => setPaymentMethod('card')}
                        className={`p-4 rounded border flex items-start justify-between cursor-pointer transition-all ${
                          paymentMethod === 'card'
                            ? 'bg-zinc-950 border-rose-500 shadow-md'
                            : 'bg-zinc-950/50 border-zinc-800 hover:border-zinc-700'
                        }`}
                      >
                        <div className="flex gap-3">
                          <div className="h-5 w-5 rounded-full border-2 border-rose-500 flex items-center justify-center mt-0.5">
                            {paymentMethod === 'card' && <div className="h-2.5 w-2.5 rounded-full bg-rose-500" />}
                          </div>
                          <div>
                            <span className="text-xs font-bold font-mono text-zinc-100 uppercase block">
                              DEBIT / CREDIT CARD (STRIPE)
                            </span>
                            <span className="text-[11px] font-mono text-zinc-400 block mt-0.5">
                              Visa, MasterCard, or UnionPay with instant confirmation.
                            </span>
                          </div>
                        </div>
                        <CreditCard className="h-5 w-5 text-rose-400 shrink-0" />
                      </label>
                    )}

                    {/* Bank Transfer */}
                    <label
                      onClick={() => setPaymentMethod('bank_transfer')}
                      className={`p-4 rounded border flex items-start justify-between cursor-pointer transition-all ${
                        paymentMethod === 'bank_transfer'
                          ? 'bg-zinc-950 border-rose-500 shadow-md'
                          : 'bg-zinc-950/50 border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex gap-3">
                        <div className="h-5 w-5 rounded-full border-2 border-rose-500 flex items-center justify-center mt-0.5">
                          {paymentMethod === 'bank_transfer' && <div className="h-2.5 w-2.5 rounded-full bg-rose-500" />}
                        </div>
                        <div>
                          <span className="text-xs font-bold font-mono text-zinc-100 uppercase block">
                            DIRECT ONLINE BANK TRANSFER
                          </span>
                          <span className="text-[11px] font-mono text-zinc-400 block mt-0.5">
                            Transfer via Meezan, HBL, Nayapay or Sadapay and send receipt on WhatsApp.
                          </span>
                        </div>
                      </div>
                      <Building2 className="h-5 w-5 text-rose-400 shrink-0" />
                    </label>
                  </div>

                  {/* Payment Execution Block */}
                  {paymentMethod === 'card' && clientSecret ? (
                    <div className="pt-4 border-t border-zinc-850">
                      <Elements stripe={stripePromise} options={{ clientSecret }}>
                        <StripePaymentForm
                          sessionData={sessionData}
                          onSuccess={onCardSuccess}
                          onError={(msg) => {
                            setGlobalError(msg);
                            toast.error(msg);
                          }}
                          onBack={() => setStep(1)}
                        />
                      </Elements>
                    </div>
                  ) : (
                    <div className="pt-4 border-t border-zinc-850 space-y-4">
                      {paymentMethod === 'bank_transfer' && (
                        <div className="p-4 rounded bg-zinc-950 border border-zinc-800 text-xs font-mono text-zinc-400 space-y-1.5">
                          <p className="font-bold text-zinc-200 uppercase">ASORA BANK ACCOUNT DETAILS:</p>
                          <p>Bank: <span className="text-zinc-100">Meezan Bank / Nayapay</span></p>
                          <p>Account Title: <span className="text-zinc-100">ASORA Streetwear</span></p>
                          <p>Account / IBAN: <span className="text-rose-400">PK00MEZN000123456789</span></p>
                          <p className="text-[11px] text-zinc-500 pt-1">
                            After placing your order, WhatsApp your payment screenshot to +92 311 0297772 with your Order Number.
                          </p>
                        </div>
                      )}

                      <Button
                        type="button"
                        disabled={confirmSession.isPending}
                        onClick={onConfirmNonCard}
                        className="w-full h-12 bg-rose-600 hover:bg-rose-700 text-white font-mono font-black text-xs uppercase tracking-widest rounded shadow-xl flex items-center justify-center gap-2"
                      >
                        {confirmSession.isPending ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>CREATING YOUR ORDER...</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="h-4 w-4" />
                            <span>PLACE ORDER ({formatCurrency(sessionData.totalAmount)})</span>
                          </>
                        )}
                      </Button>
                    </div>
                  )}

                </div>

              </div>
            )}

          </div>

          {/* RIGHT: Sticky Order Review & Items (5 cols) */}
          <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-4">
            <div className="p-6 rounded bg-zinc-900 border border-zinc-800 space-y-4">
              <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-zinc-200 border-b border-zinc-850 pb-3">
                ORDER REVIEW ({items.length} {items.length === 1 ? 'ITEM' : 'ITEMS'})
              </h2>

              {/* Items List */}
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {items.map((item) => {
                  const isCustom = Boolean(item.customConfig);
                  const custom = item.customConfig;

                  return (
                    <div
                      key={item.id || item.productVariantId}
                      className="p-3 rounded bg-zinc-950 border border-zinc-800 flex gap-3 text-left"
                    >
                      <div className="w-16 h-18 bg-zinc-900 rounded border border-zinc-800 shrink-0 overflow-hidden flex items-center justify-center p-1">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.title}
                            className="object-contain w-full h-full"
                          />
                        ) : (
                          <ShoppingBag className="h-5 w-5 text-zinc-600" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0 space-y-0.5">
                        {isCustom ? (
                          <div>
                            <span className="text-[10px] font-mono font-bold text-rose-400 block uppercase">
                              CUSTOM TEE ({custom?.color} / {custom?.size})
                            </span>
                            <span className="text-[10px] font-mono text-zinc-400 block">
                              Placement: {custom?.printPosition?.replace('_', ' + ').toUpperCase()}
                            </span>
                          </div>
                        ) : (
                          <div>
                            <p className="font-bold text-xs text-zinc-100 uppercase truncate">
                              {item.title}
                            </p>
                            {item.attributes && (
                              <p className="text-[10px] font-mono text-zinc-400">
                                {Object.values(item.attributes).join(' / ')}
                              </p>
                            )}
                          </div>
                        )}

                        <div className="flex justify-between items-center text-xs font-mono pt-1">
                          <span className="text-zinc-400">Qty: {item.quantity}</span>
                          <span className="text-zinc-100 font-bold">{formatCurrency(item.subtotal)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-2 text-xs font-mono border-t border-zinc-850 pt-3">
                <div className="flex justify-between text-zinc-400">
                  <span>Subtotal:</span>
                  <span className="text-zinc-100">{formatCurrency(sessionData?.subtotal ?? cartSubtotal)}</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Nationwide Shipping:</span>
                  <span className="text-zinc-100">
                    {sessionData ? formatCurrency(sessionData.shippingAmount) : (cartSubtotal >= 2500 ? 'FREE' : formatCurrency(200))}
                  </span>
                </div>
                {(sessionData?.discountAmount || appliedCoupon) ? (
                  <div className="flex justify-between text-rose-400">
                    <span>Discount:</span>
                    <span>-{formatCurrency(sessionData?.discountAmount ?? appliedCoupon?.discountAmount ?? 0)}</span>
                  </div>
                ) : null}

                <div className="flex justify-between text-base font-black text-zinc-100 border-t border-zinc-800 pt-3 mt-3">
                  <span>TOTAL:</span>
                  <span className="text-rose-500 font-mono">
                    {formatCurrency(sessionData?.totalAmount ?? (cartSubtotal + (cartSubtotal >= 2500 ? 0 : 200)))}
                  </span>
                </div>
              </div>

              {/* Trust Guarantee */}
              <div className="border-t border-zinc-850 pt-3 text-[10px] font-mono text-zinc-400 space-y-1">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-rose-500" />
                  <span>100% Authentic Heavyweight Cotton Guarantee</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Truck className="h-3.5 w-3.5 text-rose-500" />
                  <span>Nationwide Courier Dispatch with COD</span>
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
