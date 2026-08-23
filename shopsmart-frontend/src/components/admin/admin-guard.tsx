"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { ShieldAlert, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const ALLOWED_STAFF_ROLES = ['admin', 'inventory_manager', 'support_agent'];

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isLoading && !isAuthenticated) {
      router.replace('/login?redirect=/admin');
    }
  }, [mounted, isLoading, isAuthenticated, router]);

  // Prevent SSR/CSR hydration mismatch
  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
        <p className="text-sm font-medium text-muted-foreground">Verifying administrative access...</p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  const isStaff = user.role && ALLOWED_STAFF_ROLES.includes(user.role.toLowerCase());

  if (!isStaff) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-background">
        <div className="max-w-md w-full p-8 text-center rounded-3xl bg-card border border-border shadow-lg">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center">
            <ShieldAlert className="h-7 w-7" />
          </div>
          <h2 className="text-2xl font-black uppercase tracking-tight text-foreground mb-2">Access Restricted</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Your account ({user.email}) does not have staff privileges to access the ASORA Management Console.
          </p>
          <div className="flex flex-col gap-3">
            <Link href="/">
              <Button className="w-full font-bold rounded-full">Return to Storefront</Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" className="w-full font-bold rounded-full">Sign in with different account</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
