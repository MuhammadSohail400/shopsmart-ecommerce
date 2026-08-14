import { ResetPasswordForm } from '@/components/auth/reset-password-form';
import { GuestRoute } from '@/components/auth/guest-route';
import { Metadata } from 'next';
import { Suspense } from 'react';
import { Spinner } from '@/components/ui/spinner';

export const metadata: Metadata = {
  title: 'Reset Password - ShopSmart',
  description: 'Set a new password for your ShopSmart account.',
};

export default function ResetPasswordPage() {
  return (
    <GuestRoute>
      <Suspense fallback={<div className="flex justify-center"><Spinner className="h-6 w-6 text-primary" /></div>}>
        <ResetPasswordForm />
      </Suspense>
    </GuestRoute>
  );
}
