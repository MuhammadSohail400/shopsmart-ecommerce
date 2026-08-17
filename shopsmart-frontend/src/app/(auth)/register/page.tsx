import { RegisterForm } from '@/components/auth/register-form';
import { GuestRoute } from '@/components/auth/guest-route';
import { Metadata } from 'next';
import { Suspense } from 'react';
import { Spinner } from '@/components/ui/spinner';

export const metadata: Metadata = {
  title: 'Sign Up - ShopSmart',
  description: 'Create a new ShopSmart account.',
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
