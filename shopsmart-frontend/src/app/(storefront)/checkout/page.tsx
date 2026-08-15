"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCart, useClearCart } from '@/features/cart/hooks/use-cart';
import { 
  useCreateCheckoutSession, 
  useConfirmCheckoutSession 
} from '@/features/checkout/hooks/use-checkout';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ShoppingBag, AlertCircle, ChevronRight, Check } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Link from 'next/link';
import { toast } from 'sonner';
import { CheckoutSession } from '@/types/checkout.types';
import { Skeleton } from '@/components/ui/skeleton';

const shippingSchema = z.object({
  fullName: z.string().min(1, 'Full name is required').max(255),
  phone: z.string().min(1, 'Phone number is required'),
  line1: z.string().min(1, 'Address is required').max(255),
  city: z.string().min(1, 'City is required').max(100),
  region: z.string().min(1, 'State/Region is required').max(100),
  postalCode: z.string().max(20).optional(),
  country: z.string().length(2, 'Country code must be exactly 2 characters (e.g. US)'),
  shippingMethod: z.enum(['standard', 'express']),
});

type ShippingFormData = z.infer<typeof shippingSchema>;

export default function CheckoutPage() {
  const router = useRouter();
  const { data: cart, isLoading: isCartLoading } = useCart();
  const clearCart = useClearCart();
  
  const [step, setStep] = useState<1 | 2>(1);
  const [checkoutSessionData, setCheckoutSessionData] = useState<CheckoutSession | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cod' | 'bank_transfer'>('card');
  const [globalError, setGlobalError] = useState<string | null>(null);
  
  const createSession = useCreateCheckoutSession();
  const confirmSession = useConfirmCheckoutSession();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ShippingFormData>({
    resolver: zodResolver(shippingSchema),
    defaultValues: {
      shippingMethod: 'standard',
      country: 'US', // Default to US to pass 2-char validation
    },
  });

  const onSubmitShipping = (data: ShippingFormData) => {
    setGlobalError(null);
    const { shippingMethod, ...guestAddress } = data;
    
    createSession.mutate(
      { guestAddress, shippingMethod },
      {
        onSuccess: (session) => {
          setCheckoutSessionData(session);
          setStep(2);
          window.scrollTo(0, 0);
        },
        onError: (err: any) => {
          setGlobalError(err.message || 'Failed to create checkout session.');
          toast.error('Checkout Error', { description: err.message || 'Could not proceed to payment.' });
        }
      }
    );
  };

  const onConfirmPayment = () => {
    if (!checkoutSessionData) return;
    setGlobalError(null);
    
    // Generate simple idempotency key (normally standard UUID)
    const idempotencyKey = crypto.randomUUID();
    
    confirmSession.mutate(
      { 
        sessionId: checkoutSessionData.id, 
        data: { paymentMethod }, 
        idempotencyKey 
      },
      {
        onSuccess: (result) => {
          toast.success('Order placed successfully!');
          // Clear cart immediately upon success
          clearCart.mutate(undefined, {
            onSettled: () => {
              router.push(`/checkout/success?orderId=${result.order.id}`);
            }
          });
        },
        onError: (err: any) => {
          setGlobalError(err.message || 'Payment failed.');
          toast.error('Payment Error', { description: err.message || 'Could not complete your order.' });
        }
      }
    );
  };

  if (isCartLoading) {
    return (
      <div className="container py-8 max-w-4xl mx-auto space-y-8">
        <Skeleton className="h-12 w-1/3" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container py-20 text-center flex flex-col items-center justify-center min-h-[50vh]">
        <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
        <p className="text-muted-foreground mb-8">Add some products to your cart to proceed with checkout.</p>
        <Link href="/products" className={buttonVariants({ size: "lg" })}>
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="container py-8 max-w-5xl mx-auto">
      <div className="flex items-center gap-2 mb-8 text-sm text-muted-foreground">
        <Link href="/cart" className="hover:text-primary transition-colors">Cart</Link>
        <ChevronRight className="h-4 w-4" />
        <span className={step >= 1 ? 'text-primary font-medium' : ''}>Shipping</span>
        <ChevronRight className="h-4 w-4" />
        <span className={step >= 2 ? 'text-primary font-medium' : ''}>Payment</span>
      </div>

      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      {globalError && (
        <Alert variant="destructive" className="mb-8">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{globalError}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-8 space-y-6">
          
          {step === 1 && (
            <form onSubmit={handleSubmit(onSubmitShipping)}>
              <Card>
                <CardHeader>
                  <CardTitle>Shipping Address</CardTitle>
                  <CardDescription>Enter your delivery details.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input id="fullName" {...register('fullName')} placeholder="John Doe" />
                      {errors.fullName && <p className="text-sm text-destructive">{errors.fullName.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input id="phone" {...register('phone')} placeholder="+1 234 567 890" />
                      {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="line1">Address Line 1</Label>
                    <Input id="line1" {...register('line1')} placeholder="123 Main St" />
                    {errors.line1 && <p className="text-sm text-destructive">{errors.line1.message}</p>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input id="city" {...register('city')} placeholder="New York" />
                      {errors.city && <p className="text-sm text-destructive">{errors.city.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="region">State / Region</Label>
                      <Input id="region" {...register('region')} placeholder="NY" />
                      {errors.region && <p className="text-sm text-destructive">{errors.region.message}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="postalCode">Postal Code</Label>
                      <Input id="postalCode" {...register('postalCode')} placeholder="10001" />
                      {errors.postalCode && <p className="text-sm text-destructive">{errors.postalCode.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="country">Country Code</Label>
                      <Input id="country" {...register('country')} placeholder="US" maxLength={2} />
                      {errors.country && <p className="text-sm text-destructive">{errors.country.message}</p>}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Shipping Method</CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup 
                    defaultValue="standard" 
                    onValueChange={(val) => register('shippingMethod').onChange({ target: { name: 'shippingMethod', value: val }})}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                  >
                    <div>
                      <RadioGroupItem value="standard" id="standard" className="peer sr-only" />
                      <Label
                        htmlFor="standard"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                      >
                        <span className="text-sm font-semibold">Standard Shipping</span>
                        <span className="text-sm text-muted-foreground mt-1">3-5 business days</span>
                      </Label>
                    </div>
                    <div>
                      <RadioGroupItem value="express" id="express" className="peer sr-only" />
                      <Label
                        htmlFor="express"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                      >
                        <span className="text-sm font-semibold">Express Shipping</span>
                        <span className="text-sm text-muted-foreground mt-1">1-2 business days</span>
                      </Label>
                    </div>
                  </RadioGroup>
                  {errors.shippingMethod && <p className="text-sm text-destructive mt-2">{errors.shippingMethod.message}</p>}
                </CardContent>
                <CardFooter className="flex justify-end pt-6 border-t">
                  <Button type="submit" size="lg" disabled={createSession.isPending}>
                    {createSession.isPending ? 'Proceeding...' : 'Continue to Payment'}
                  </Button>
                </CardFooter>
              </Card>
            </form>
          )}

          {step === 2 && checkoutSessionData && (
            <Card>
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
                <CardDescription>Select how you would like to pay for your order.</CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup 
                  value={paymentMethod} 
                  onValueChange={(val: any) => setPaymentMethod(val)}
                  className="space-y-4"
                >
                  <div className="flex items-center space-x-3 border p-4 rounded-lg">
                    <RadioGroupItem value="card" id="pm-card" />
                    <Label htmlFor="pm-card" className="flex-1 cursor-pointer font-medium">Credit / Debit Card</Label>
                  </div>
                  <div className="flex items-center space-x-3 border p-4 rounded-lg">
                    <RadioGroupItem value="bank_transfer" id="pm-bank" />
                    <Label htmlFor="pm-bank" className="flex-1 cursor-pointer font-medium">Bank Transfer</Label>
                  </div>
                  <div className="flex items-center space-x-3 border p-4 rounded-lg">
                    <RadioGroupItem value="cod" id="pm-cod" />
                    <Label htmlFor="pm-cod" className="flex-1 cursor-pointer font-medium">Cash on Delivery (COD)</Label>
                  </div>
                </RadioGroup>
                
                <div className="mt-8 bg-muted p-4 rounded-lg flex items-start gap-3 text-sm">
                  <AlertCircle className="h-5 w-5 text-muted-foreground shrink-0" />
                  <p className="text-muted-foreground">
                    This is a development environment. No actual payment will be processed. Clicking "Confirm Order" will simulate a successful transaction based on the selected method.
                  </p>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between pt-6 border-t">
                <Button variant="outline" onClick={() => setStep(1)} disabled={confirmSession.isPending}>
                  Back to Shipping
                </Button>
                <Button size="lg" onClick={onConfirmPayment} disabled={confirmSession.isPending}>
                  {confirmSession.isPending ? 'Processing...' : `Confirm Order • $${checkoutSessionData.total}`}
                </Button>
              </CardFooter>
            </Card>
          )}

        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-4">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4 max-h-[300px] overflow-auto pr-2">
                {cart.items.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="h-16 w-16 bg-muted rounded-md overflow-hidden shrink-0">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.productTitle} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-secondary">
                          <ShoppingBag className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium truncate">{item.productTitle}</h4>
                      <p className="text-xs text-muted-foreground mt-1">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-sm font-medium text-right">
                      ${(Number(item.priceAtAdd) * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>

              <Separator />

              {/* Show frontend cart totals if Step 1, or Authoritative Session Totals if Step 2 */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${step === 2 && checkoutSessionData ? checkoutSessionData.subtotal : cart.subtotal}</span>
                </div>
                {step === 2 && checkoutSessionData && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Shipping</span>
                      <span>${checkoutSessionData.shippingTotal}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tax</span>
                      <span>${checkoutSessionData.tax}</span>
                    </div>
                  </>
                )}
                {step === 1 && (
                  <div className="flex justify-between text-muted-foreground text-xs">
                    <span>Shipping & taxes calculated at next step</span>
                  </div>
                )}
                <Separator className="my-2" />
                <div className="flex justify-between text-base font-bold">
                  <span>Total</span>
                  <span>${step === 2 && checkoutSessionData ? checkoutSessionData.total : cart.subtotal}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
