import { RegisterForm } from '@/components/auth/register-form';
import { GuestRoute } from '@/components/auth/guest-route';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign Up - ShopSmart',
  description: 'Create a new ShopSmart account.',
};

export default function RegisterPage() {
  return (
    <GuestRoute>
      <RegisterForm />
    </GuestRoute>
  );
}
