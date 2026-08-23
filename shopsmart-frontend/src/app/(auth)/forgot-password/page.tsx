import { ForgotPasswordForm } from '@/components/auth/forgot-password-form';
import { GuestRoute } from '@/components/auth/guest-route';
import { Metadata } from 'next';
import { Suspense } from 'react';
import { Spinner } from '@/components/ui/spinner';

export const metadata: Metadata = {
  title: 'Forgot Password | ASORA',
  description: 'Reset your ASORA account password.',
};

export default function ForgotPasswordPage() {
  return (
    <GuestRoute>
      <Suspense fallback={<div className="flex justify-center"><Spinner className="h-6 w-6 text-primary" /></div>}>
        <ForgotPasswordForm />
      </Suspense>
    </GuestRoute>
  );
}
