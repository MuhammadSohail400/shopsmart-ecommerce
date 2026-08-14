"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCurrentUser } from '@/hooks/use-auth';


export function GuestRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { data: user } = useCurrentUser();
  useEffect(() => {
    if (user) {
      router.replace('/'); // Redirect logged-in users away from auth pages
    }
  }, [user, router]);

  return <>{children}</>;
}
