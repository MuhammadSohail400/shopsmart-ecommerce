import { LoginForm } from '@/components/auth/login-form';
import { GuestRoute } from '@/components/auth/guest-route';
import { Metadata } from 'next';
import { Suspense } from 'react';
import { Spinner } from '@/components/ui/spinner';

export const metadata: Metadata = {
  title: 'Sign In | ASORA Streetwear',
  description: 'Sign in to your ASORA account to track drops, orders, and wishlist.',
};

export default function LoginPage() {
  return (
    <GuestRoute>
      <Suspense fallback={<div className="flex justify-center"><Spinner className="h-6 w-6 text-primary" /></div>}>
        <LoginForm />
      </Suspense>
    </GuestRoute>
  );
}
