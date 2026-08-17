"use client";

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCurrentUser } from '@/hooks/use-auth';

function GuestRouteRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: user } = useCurrentUser();

  useEffect(() => {
    if (user) {
      const redirect = searchParams.get('redirect');
      if (redirect && redirect.startsWith('/')) {
        router.replace(redirect);
      } else {
        router.replace('/');
      }
    }
  }, [user, router, searchParams]);

  return null;
}

export function GuestRoute({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Suspense fallback={null}>
        <GuestRouteRedirect />
      </Suspense>
      {children}
    </>
  );
}
