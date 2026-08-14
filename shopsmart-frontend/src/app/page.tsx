"use client";

import { useLogout, useCurrentUser } from '@/hooks/use-auth';
import { Button, buttonVariants } from '@/components/ui/button';
import Link from 'next/link';

export default function Home() {
  const logout = useLogout();
  const { data: user } = useCurrentUser();
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24 bg-zinc-50">
      <div className="max-w-xl text-center space-y-6">
        <h1 className="text-4xl font-bold tracking-tight text-zinc-900">
          ShopSmart Frontend Foundation
        </h1>
        <p className="text-lg text-zinc-600">
          The Next.js 15 foundation has been successfully initialized.
        </p>
        <div className="flex gap-4 justify-center">
          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">App Router</span>
          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">Tailwind CSS 4</span>
          <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">React Query</span>
        </div>

        <div className="mt-8 p-6 bg-white rounded-lg border shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Authentication Status</h2>
          {user ? (
            <div className="space-y-4">
              <p className="text-green-600 font-medium">You are logged in as: {user.email || user.phone}</p>
              <div className="flex gap-4 justify-center">
                <Button variant="outline" onClick={() => logout.mutate()} disabled={logout.isPending}>
                  {logout.isPending ? 'Logging out...' : 'Log Out'}
                </Button>
                <Link href="/sessions" className={buttonVariants({ variant: 'default' })}>
                  Manage Sessions
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-zinc-600">You are currently logged out.</p>
              <div className="flex gap-4 justify-center">
                <Link href="/login" className={buttonVariants({ variant: 'default' })}>
                  Sign In
                </Link>
                <Link href="/register" className={buttonVariants({ variant: 'outline' })}>
                  Create Account
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
