"use client";

import { useSearchParams } from 'next/navigation';
import { Button, buttonVariants } from '@/components/ui/button';
import { CheckCircle2, ShoppingBag } from 'lucide-react';
import Link from 'next/link';

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');

  return (
    <div className="container py-20 text-center flex flex-col items-center justify-center min-h-[50vh]">
      <CheckCircle2 className="h-16 w-16 text-green-500 mb-6" />
      <h1 className="text-3xl font-bold mb-4">Order Placed Successfully!</h1>
      <p className="text-muted-foreground mb-2 text-lg">Thank you for your purchase.</p>
      
      {orderId && (
        <p className="text-sm font-medium mb-8 bg-muted px-4 py-2 rounded-md">
          Order ID: <span className="font-mono">{orderId}</span>
        </p>
      )}

      <div className="flex gap-4">
        <Link href="/products" className={buttonVariants({ size: "lg" })}>
          <ShoppingBag className="h-4 w-4 mr-2" />
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
