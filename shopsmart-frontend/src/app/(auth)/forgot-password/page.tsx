import { ForgotPasswordForm } from '@/components/auth/forgot-password-form';
import { GuestRoute } from '@/components/auth/guest-route';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Forgot Password - ShopSmart',
  description: 'Reset your ShopSmart account password.',
};

export default function ForgotPasswordPage() {
  return (
    <GuestRoute>
      <ForgotPasswordForm />
    </GuestRoute>
  );
}
