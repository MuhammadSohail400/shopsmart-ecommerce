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
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
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
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

import Link from 'next/link';
import { toast } from 'sonner';
import { CheckoutSession, ConfirmCheckoutResult } from '@/types/checkout.types';
import { Skeleton } from '@/components/ui/skeleton';
import { ApiError } from '@/lib/api-client';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { formatCurrency } from '@/lib/utils';

// ─── Stripe setup (publishable key only — never the secret) ─────────────────
const isStripeConfigured =
  Boolean(env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) &&
  !env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.includes('your_stripe_publishable_key_here');

const stripePromise = isStripeConfigured
  ? loadStripe(env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null;


// ─── Shipping form schema (mirrors backend checkout.validators.ts) ───────────
const shippingSchema = z.object({
  fullName: z.string().min(1, 'Full name is required').max(255),
  phone: z.string().min(1, 'Phone number is required'),
  line1: z.string().min(1, 'Address is required').max(255),
  city: z.string().min(1, 'City is required').max(100),
  region: z.string().min(1, 'State/Region is required').max(100),
  postalCode: z.string().max(20).optional(),
  country: z.string().length(2, 'Must be a 2-letter country code (e.g. US, PK, GB)'),
  shippingMethod: z.enum(['standard', 'express']),
});

type ShippingFormData = z.infer<typeof shippingSchema>;

// ─── Stripe Payment Form (inner component, used inside <Elements>) ────────────
function StripePaymentForm({
  sessionData,
  createdOrder,
  onSuccess,
  onError,
  onBack,
}: {
  sessionData: CheckoutSession;
  createdOrder: ConfirmCheckoutResult | null;
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

    // Confirm the Stripe payment on the client side
    const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
    });

    if (stripeError) {
      setIsProcessing(false);
      onError(stripeError.message ?? 'Payment failed. Please try again.');
      toast.error('Payment Failed', { description: stripeError.message });
      return;
    }

    if (paymentIntent?.status === 'succeeded' || paymentIntent?.status === 'processing') {
      setIsProcessing(false);
      if (createdOrder) {
        onSuccess(createdOrder);
      }
    } else {
      setIsProcessing(false);
      onError('Payment was not completed. Please try again.');
    }
  };

  return (
    <form onSubmit={handleStripeSubmit}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-primary" />
            Secure Card Payment
          </CardTitle>
          <CardDescription>
            Your payment is secured by Stripe. We never store card details.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <PaymentElement options={{ layout: 'tabs' }} />
          <div className="bg-muted/50 border rounded-lg p-3 flex items-start gap-2 text-xs text-muted-foreground">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>
              This is test mode. Use card <code className="font-mono bg-muted px-1 rounded">4242 4242 4242 4242</code>,
              any future expiry, and any 3-digit CVC.
            </span>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between pt-6 border-t gap-3">
          <Button type="button" variant="outline" onClick={onBack} disabled={isProcessing}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Button
            type="submit"
            size="lg"
            disabled={!stripe || !elements || isProcessing}
            className="min-w-[200px]"
          >
            {isProcessing ? (
              <span className="flex items-center gap-2">
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Processing Payment...
              </span>
            ) : (
              <span className="flex items-center gap-2 font-bold">
                <Lock className="h-4 w-4" />
                Pay {formatCurrency(sessionData.totalAmount)}
              </span>
            )}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}

// ─── Main Checkout Page ────────────────────────────────────────────────────────
function CheckoutContent() {
  const router = useRouter();
  const { data: cart, isLoading: isCartLoading } = useCart();
  const clearCart = useClearCart();

  // Step: 1=shipping/method, 2=payment
  const [step, setStep] = useState<1 | 2>(1);
  const [sessionData, setSessionData] = useState<CheckoutSession | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [createdOrder, setCreatedOrder] = useState<ConfirmCheckoutResult | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cod' | 'bank_transfer'>('cod');
  const [globalError, setGlobalError] = useState<string | null>(null);

  // Idempotency key for COD/bank_transfer confirm — generated once per attempt.
  // For card payments, Stripe handles dedup via the PaymentIntent itself.
  const idempotencyKeyRef = useRef<string>(crypto.randomUUID());

  const createSession = useCreateCheckoutSession();
  const confirmSession = useConfirmCheckoutSession();

  const { register, handleSubmit, formState: { errors }, watch } = useForm<ShippingFormData>({
    resolver: zodResolver(shippingSchema),
    defaultValues: {
      shippingMethod: 'standard',
      country: 'PK',
    },
  });

  const selectedMethod = watch('shippingMethod');

  // ── Step 1: Create checkout session (no payment yet) ──────────────────────
  const onSubmitShipping = useCallback((data: ShippingFormData) => {
    setGlobalError(null);
    const { shippingMethod, ...guestAddress } = data;

    createSession.mutate(
      { guestAddress, shippingMethod },
      {
        onSuccess: (session) => {
          setSessionData(session);
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

  // ── Step 2 (COD/bank_transfer): Confirm directly — no Stripe needed ───────
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
          toast.success('Order placed!');
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
          toast.error('Payment Error', { description: message });
          // Generate a new idempotency key so a retry is treated as a fresh attempt
          idempotencyKeyRef.current = crypto.randomUUID();
        },
      }
    );
  }, [sessionData, paymentMethod, confirmSession, clearCart, router]);

  // ── Card payment success callback (from StripePaymentForm) ────────────────
  const onCardSuccess = useCallback((result: ConfirmCheckoutResult) => {
    toast.success('Payment successful! Your order is confirmed.');
    clearCart.mutate(undefined, {
      onSettled: () => {
        router.push(
          `/checkout/success?orderId=${result.order.id}&orderNumber=${result.order.orderNumber}`
        );
      },
    });
  }, [clearCart, router]);

  const onCardError = useCallback((message: string) => {
    setGlobalError(message);
  }, []);

  // ─── Loading skeleton ───────────────────────────────────────────────────────
  if (isCartLoading) {
    return (
      <div className="container py-8 max-w-5xl mx-auto space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-4">
            <Skeleton className="h-[320px] w-full rounded-xl" />
            <Skeleton className="h-[200px] w-full rounded-xl" />
          </div>
          <div className="lg:col-span-4">
            <Skeleton className="h-[300px] w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  // ─── Empty cart ─────────────────────────────────────────────────────────────
  if (!cart || cart.items.length === 0) {
    return (
      <div className="container py-20 text-center flex flex-col items-center justify-center min-h-[50vh]">
        <div className="p-6 rounded-full bg-muted mb-6">
          <ShoppingBag className="h-12 w-12 text-muted-foreground" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
        <p className="text-muted-foreground mb-8">Add some products to your cart to proceed with checkout.</p>
        <Link href="/products" className={buttonVariants({ size: 'lg' })}>
          Continue Shopping
        </Link>
      </div>
    );
  }

  // ─── Step progress indicator ────────────────────────────────────────────────
  const steps = [
    { label: 'Shipping', num: 1 },
    { label: 'Payment', num: 2 },
  ];

  return (
    <div className="container py-6 max-w-5xl mx-auto">
      {/* Breadcrumb + steps */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Link href="/cart" className="hover:text-primary transition-colors">Cart</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          {steps.map((s, i) => (
            <span key={s.num} className="flex items-center gap-1.5">
              <span className={step >= s.num ? 'text-foreground font-medium' : 'text-muted-foreground'}>
                {s.label}
              </span>
              {i < steps.length - 1 && <ChevronRight className="h-3.5 w-3.5" />}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-2">
          {steps.map((s) => (
            <div
              key={s.num}
              className={`flex items-center justify-center h-7 w-7 rounded-full text-xs font-bold transition-colors ${
                step > s.num
                  ? 'bg-primary text-primary-foreground'
                  : step === s.num
                  ? 'bg-primary text-primary-foreground ring-2 ring-primary/30'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {step > s.num ? <CheckCircle2 className="h-4 w-4" /> : s.num}
            </div>
          ))}
        </div>
      </div>

      {globalError && (
        <Alert variant="destructive" className="mb-5">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Something went wrong</AlertTitle>
          <AlertDescription>{globalError}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ── Main form area ─────────────────────────────────────────────── */}
        <div className="lg:col-span-8 space-y-5">

          {/* ── STEP 1: Shipping address + method ─────────────────────── */}
          {step === 1 && (
            <form onSubmit={handleSubmit(onSubmitShipping)} className="space-y-5">
              {/* Address card */}
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Package className="h-4 w-4 text-primary" />
                    Shipping Address
                  </CardTitle>
                  <CardDescription>Enter where you&apos;d like your order delivered.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="fullName">Full Name *</Label>
                      <Input id="fullName" {...register('fullName')} placeholder="Muhammad Sohail" />
                      {errors.fullName && <p className="text-xs text-destructive">{errors.fullName.message}</p>}
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="phone">Phone *</Label>
                      <Input id="phone" {...register('phone')} placeholder="+92 311 0297772" type="tel" />
                      {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="line1">Street Address *</Label>
                    <Input id="line1" {...register('line1')} placeholder="House #14, Street 5, Phase 6, DHA" />
                    {errors.line1 && <p className="text-xs text-destructive">{errors.line1.message}</p>}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="city">City *</Label>
                      <Input id="city" {...register('city')} placeholder="Karachi" />
                      {errors.city && <p className="text-xs text-destructive">{errors.city.message}</p>}
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="region">State / Region *</Label>
                      <Input id="region" {...register('region')} placeholder="Sindh" />
                      {errors.region && <p className="text-xs text-destructive">{errors.region.message}</p>}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="postalCode">Postal Code</Label>
                      <Input id="postalCode" {...register('postalCode')} placeholder="75500" />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="country">Country Code *</Label>
                      <Input
                        id="country"
                        {...register('country')}
                        placeholder="PK"
                        maxLength={2}
                        className="uppercase"
                      />
                      <p className="text-xs text-muted-foreground">2-letter ISO code: PK, AE, US, GB, SA…</p>
                      {errors.country && <p className="text-xs text-destructive">{errors.country.message}</p>}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Shipping method card */}
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Truck className="h-4 w-4 text-primary" />
                    Shipping Method
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup
                    defaultValue="standard"
                    onValueChange={(val) =>
                      register('shippingMethod').onChange({ target: { name: 'shippingMethod', value: val } })
                    }
                    className="grid grid-cols-1 sm:grid-cols-2 gap-3"
                  >
                    {[
                      { id: 'standard', label: 'Standard Delivery', desc: '3–5 business days · Rs. 250 (Doorstep Delivery)', icon: Truck },
                      { id: 'express', label: 'Express Courier', desc: '1–2 business days · Rs. 500 (Priority Dispatch)', icon: Package },
                    ].map(({ id, label, desc }) => (
                      <div key={id}>
                        <RadioGroupItem value={id} id={`ship-${id}`} className="peer sr-only" />
                        <Label
                          htmlFor={`ship-${id}`}
                          className={`flex flex-col p-4 rounded-lg border-2 cursor-pointer transition-all hover:border-primary/50
                            peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5
                            ${selectedMethod === id ? 'border-primary bg-primary/5' : 'border-border'}`}
                        >
                          <span className="font-semibold text-sm">{label}</span>
                          <span className="text-xs text-muted-foreground mt-1">{desc}</span>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                  {errors.shippingMethod && (
                    <p className="text-xs text-destructive mt-2">{errors.shippingMethod.message}</p>
                  )}
                </CardContent>
                <CardFooter className="justify-end pt-4 border-t">
                  <Button type="submit" size="lg" disabled={createSession.isPending} className="min-w-[180px]">
                    {createSession.isPending ? (
                      <span className="flex items-center gap-2">
                        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        Calculating...
                      </span>
                    ) : (
                      <>Continue to Payment <ChevronRight className="h-4 w-4 ml-1" /></>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </form>
          )}

          {/* ── STEP 2: Payment ──────────────────────────────────────── */}
          {step === 2 && sessionData && (
            <div className="space-y-5">
              {/* Payment method selector */}
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-base flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-primary" />
                    Payment Method
                  </CardTitle>
                  <CardDescription>Choose how you&apos;d like to pay for your order.</CardDescription>
                </CardHeader>
                <CardContent>
                  <RadioGroup
                    value={paymentMethod}
                    onValueChange={(val: typeof paymentMethod) => {
                      setPaymentMethod(val);
                      setClientSecret(null); // reset Stripe if switching
                    }}
                    className="space-y-3"
                  >
                    {[
                      { id: 'cod', label: 'Cash on Delivery (COD)', desc: 'Pay in cash when your order arrives at your doorstep', icon: Truck },
                      { id: 'card', label: 'Credit / Debit Card', desc: 'Visa, Mastercard, PayPak — 256-bit encrypted', icon: CreditCard },
                      { id: 'bank_transfer', label: 'Bank Transfer / EasyPaisa / JazzCash', desc: "We'll provide bank details after order confirmation", icon: Building2 },
                    ].map(({ id, label, desc, icon: Icon }) => (
                      <div
                        key={id}
                        className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all hover:border-primary/40
                          ${paymentMethod === id ? 'border-primary bg-primary/5 shadow-xs' : 'border-border'}`}
                        onClick={() => {
                          setPaymentMethod(id as typeof paymentMethod);
                          setClientSecret(null);
                        }}
                      >
                        <RadioGroupItem value={id} id={`pm-${id}`} />
                        <Label htmlFor={`pm-${id}`} className="flex-1 cursor-pointer">
                          <span className="flex items-center gap-2 font-bold text-sm">
                            <Icon className="h-4 w-4 text-primary" />
                            {label}
                          </span>
                          <span className="text-xs text-muted-foreground mt-0.5 block">{desc}</span>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </CardContent>
              </Card>

              {/* ── Card payment: Stripe Elements ──── */}
              {paymentMethod === 'card' && (
                <>
                  {!isStripeConfigured ? (
                    <Card>
                      <CardContent className="pt-6 space-y-4">
                        <Alert className="border-amber-500/40 bg-amber-500/10 text-amber-900 dark:text-amber-200">
                          <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                          <AlertTitle className="font-bold">Card Payments In Test Mode</AlertTitle>
                          <AlertDescription className="text-xs space-y-2 mt-1.5 leading-relaxed">
                            <p>
                              Online card processing is active. You can also choose <strong>Cash on Delivery (COD)</strong> to place your order immediately with zero advance payment!
                            </p>
                          </AlertDescription>
                        </Alert>
                        <div className="flex justify-center">
                          <Button
                            variant="outline"
                            onClick={() => setPaymentMethod('cod')}
                            className="rounded-full font-bold"
                          >
                            <Truck className="h-4 w-4 mr-2 text-primary" />
                            Switch to Cash on Delivery (COD)
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ) : !clientSecret ? (
                    <Card className="border-primary/20">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-bold flex items-center gap-2">
                          <CreditCard className="h-4 w-4 text-primary" />
                          Card Details & Checkout
                        </CardTitle>
                        <CardDescription className="text-xs">
                          Pay securely with your credit or debit card.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center gap-2.5 text-xs text-muted-foreground bg-muted/40 p-3 rounded-xl">
                          <Lock className="h-4 w-4 text-emerald-600 shrink-0" />
                          <span>256-bit encrypted checkout. Your card credentials are never stored.</span>
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between border-t pt-4 gap-3">
                        <Button variant="outline" onClick={() => setStep(1)} disabled={confirmSession.isPending}>
                          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Shipping
                        </Button>
                        <Button
                          onClick={() => {
                            const key = idempotencyKeyRef.current;
                            confirmSession.mutate(
                              { sessionId: sessionData.sessionId, data: { paymentMethod: 'card' }, idempotencyKey: key },
                              {
                                onSuccess: (result) => {
                                  const secret = result.payment?.clientSecret;
                                  if (secret) {
                                    setCreatedOrder(result);
                                    setClientSecret(secret);
                                  } else {
                                    setGlobalError('Unable to load card form. Please try again.');
                                  }
                                },
                                onError: (err) => {
                                  const message = err instanceof ApiError ? err.userMessage : err.message;
                                  setGlobalError(message);
                                  toast.error('Error', { description: message });
                                  idempotencyKeyRef.current = crypto.randomUUID();
                                },
                              }
                            );
                          }}
                          disabled={confirmSession.isPending}
                          size="lg"
                          className="font-bold min-w-[200px]"
                        >
                          {confirmSession.isPending ? (
                            <span className="flex items-center gap-2">
                              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                              Loading Card Form...
                            </span>
                          ) : (
                            <><CreditCard className="h-4 w-4 mr-2" />Enter Card Information</>
                          )}
                        </Button>
                      </CardFooter>
                    </Card>
                  ) : (
                    <Elements
                      stripe={stripePromise}
                      options={{
                        clientSecret,
                        appearance: {
                          theme: 'stripe',
                          variables: { colorPrimary: '#6366f1' },
                        },
                      }}
                    >
                      <StripePaymentForm
                        sessionData={sessionData}
                        createdOrder={createdOrder}
                        onSuccess={onCardSuccess}
                        onError={onCardError}
                        onBack={() => {
                          setClientSecret(null);
                          setCreatedOrder(null);
                          setStep(1);
                        }}
                      />
                    </Elements>
                  )}
                </>
              )}

              {/* ── Cash on Delivery (COD) card ── */}
              {paymentMethod === 'cod' && (
                <Card className="border-emerald-500/30 bg-card">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                      <Truck className="h-4 w-4 text-emerald-600" />
                      Cash on Delivery (Doorstep Payment)
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Pay in cash when your order is delivered to your address.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-start gap-3 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-900 dark:text-emerald-200">
                      <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <div className="text-xs space-y-1">
                        <p className="font-bold">No Advance Payment Required</p>
                        <p className="text-muted-foreground">You can inspect your package and pay the exact amount to the courier upon delivery.</p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between border-t pt-4 gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setStep(1)}
                      disabled={confirmSession.isPending}
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back to Shipping
                    </Button>
                    <Button
                      size="lg"
                      onClick={onConfirmNonCard}
                      disabled={confirmSession.isPending}
                      className="min-w-[220px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      {confirmSession.isPending ? (
                        <span className="flex items-center gap-2">
                          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                          Placing Order...
                        </span>
                      ) : (
                        <>Place Order with COD · {formatCurrency(sessionData.totalAmount)}</>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              )}

              {/* ── Bank Transfer card ── */}
              {paymentMethod === 'bank_transfer' && (
                <Card className="border-blue-500/30 bg-card">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-blue-600" />
                      Direct Bank Transfer / EasyPaisa / JazzCash
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Transfer payment directly to our official business bank account.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-start gap-3 p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-900 dark:text-blue-200">
                      <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                      <div className="text-xs space-y-1">
                        <p className="font-bold">Bank & Wallet Details</p>
                        <p className="text-muted-foreground">Account details (HBL / Meezan Bank & EasyPaisa) will be sent via email with your order confirmation. Your order will be dispatched once payment is verified.</p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between border-t pt-4 gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setStep(1)}
                      disabled={confirmSession.isPending}
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back to Shipping
                    </Button>
                    <Button
                      size="lg"
                      onClick={onConfirmNonCard}
                      disabled={confirmSession.isPending}
                      className="min-w-[220px] font-bold"
                    >
                      {confirmSession.isPending ? (
                        <span className="flex items-center gap-2">
                          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                          Placing Order...
                        </span>
                      ) : (
                        <>Place Order & View Details · {formatCurrency(sessionData.totalAmount)}</>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              )}
            </div>
          )}
        </div>

        {/* ── Order summary sidebar ─────────────────────────────────── */}
        <div className="lg:col-span-4">
          <Card className="sticky top-24">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Order Summary</CardTitle>
              <CardDescription>{cart.items.length} item{cart.items.length !== 1 ? 's' : ''}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Items list */}
              <div className="space-y-3 max-h-[240px] overflow-y-auto pr-1">
                {cart.items.map((item) => (
                  <div key={item.productVariantId} className="flex gap-3">
                    <div className="h-14 w-14 bg-muted rounded-lg overflow-hidden shrink-0 border">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="h-5 w-5 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium line-clamp-2">{item.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-sm font-semibold shrink-0">
                      {formatCurrency(item.subtotal)}
                    </div>
                  </div>
                ))}
              </div>

              <Separator />

              {/* Totals */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-bold">{formatCurrency(step === 2 && sessionData ? Number(sessionData.subtotal) : cart.subtotal)}</span>
                </div>

                {step === 2 && sessionData ? (
                  <>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Shipping</span>
                      <span>{formatCurrency(sessionData.shippingAmount)}</span>
                    </div>
                    {Number(sessionData.taxAmount) > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Tax</span>
                        <span>{formatCurrency(sessionData.taxAmount)}</span>
                      </div>
                    )}
                    {Number(sessionData.discountAmount) > 0 && (
                      <div className="flex justify-between text-green-600 font-bold">
                        <span>Discount</span>
                        <span>−{formatCurrency(sessionData.discountAmount)}</span>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-xs text-muted-foreground">
                    Shipping & tax calculated at next step
                  </div>
                )}

                <Separator />
                <div className="flex justify-between font-bold text-base pt-1">
                  <span>Total</span>
                  <span className="text-primary font-black">
                    {formatCurrency(step === 2 && sessionData ? Number(sessionData.totalAmount) : cart.subtotal)}
                  </span>
                </div>
              </div>

              {/* Trust badge */}
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-2 border-t">
                <Lock className="h-3 w-3" />
                Secure checkout — 256-bit SSL encryption
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <ProtectedRoute>
      <CheckoutContent />
    </ProtectedRoute>
  );
}
