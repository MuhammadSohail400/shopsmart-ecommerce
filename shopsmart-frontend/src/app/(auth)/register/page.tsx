import { RegisterForm } from '@/components/auth/register-form';
import { GuestRoute } from '@/components/auth/guest-route';
import { Metadata } from 'next';
import { Suspense } from 'react';
import { Spinner } from '@/components/ui/spinner';

export const metadata: Metadata = {
  title: 'Create Account | ASORA Streetwear',
  description: 'Create an ASORA account to unlock early drops, member discounts, and custom designs.',
};

export default function RegisterPage() {
  return (
    <GuestRoute>
      <Suspense fallback={<div className="flex justify-center"><Spinner className="h-6 w-6 text-primary" /></div>}>
        <RegisterForm />
      </Suspense>
    </GuestRoute>
  );
}
